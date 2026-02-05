import type { APIRoute } from 'astro';

export const prerender = false;

import { updateOrderPaymentStatus, getOrderByNumber } from '../../../lib/supabase';
import { verifyIPN, isNetopiaConfigured, type IPNPayload } from '../../../lib/netopia';
import { sendOrderConfirmationEmails } from '../../../lib/email';
import type { Database } from '../../../lib/database.types';

type OrderStatus = Database['public']['Enums']['order_status'];

// Netopia payment status codes
const NETOPIA_STATUS = {
  PENDING: 0,
  PENDING_AUTH: 1,
  PAID: 2,
  PAID_PENDING: 3,
  SCHEDULED: 4,
  CREDIT: 5,
  DECLINED: 6,
  ERROR: 7,
  CANCELED: 8,
} as const;

function mapNetopiaStatusToOrderStatus(netopiaStatus: number): { orderStatus: OrderStatus; paymentStatus: string } {
  switch (netopiaStatus) {
    case NETOPIA_STATUS.PAID:
    case NETOPIA_STATUS.PAID_PENDING:
    case NETOPIA_STATUS.CREDIT:
      return { orderStatus: 'confirmed', paymentStatus: 'paid' };
    case NETOPIA_STATUS.DECLINED:
    case NETOPIA_STATUS.ERROR:
      return { orderStatus: 'cancelled', paymentStatus: 'failed' };
    case NETOPIA_STATUS.CANCELED:
      return { orderStatus: 'cancelled', paymentStatus: 'cancelled' };
    default:
      return { orderStatus: 'pending', paymentStatus: 'pending' };
  }
}

function jsonResponse(data: object, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  console.log(JSON.stringify({ event: 'ipn_received' }));

  try {
    // Get verification token from header (Netopia v2)
    const verifyToken = request.headers.get('verification-token');

    // Parse the IPN payload
    const contentType = request.headers.get('content-type');
    let payload: IPNPayload;

    // Clone request to read body as text first for debugging
    const bodyText = await request.text();
    if (!bodyText) {
      console.error(JSON.stringify({ event: 'ipn_error', error: 'empty_body' }));
      return jsonResponse(
        { errorType: 1, errorCode: 'EMPTY_BODY', errorMessage: 'Empty request body' },
        400
      );
    }

    if (contentType?.includes('application/json')) {
      payload = JSON.parse(bodyText);
    } else {
      // Handle form-encoded data if needed
      const params = new URLSearchParams(bodyText);
      payload = JSON.parse(params.get('data') || '{}');
    }

    console.log(JSON.stringify({ event: 'ipn_parsed', order: payload.order?.orderID, netopiaStatus: payload.payment?.status, hasVerifyToken: !!verifyToken }));

    // Verify IPN signature if Netopia is configured and token is present
    if (isNetopiaConfigured() && verifyToken) {
      const isValid = await verifyIPN(verifyToken, payload);
      if (!isValid) {
        console.error(JSON.stringify({ event: 'ipn_verification_failed', order: payload.order?.orderID }));
        return jsonResponse(
          { errorType: 1, errorCode: 'INVALID_SIGNATURE', errorMessage: 'Invalid signature' },
          400
        );
      }
      console.log(JSON.stringify({ event: 'ipn_verified', order: payload.order?.orderID }));
    } else if (isNetopiaConfigured() && !verifyToken) {
      console.warn(JSON.stringify({ event: 'ipn_no_verify_token', order: payload.order?.orderID }));
      // Continue processing - some Netopia configurations may not send token
    }

    // Extract order information
    // orderID from Netopia is our order_number (e.g., "2026-000001")
    const orderNumber = payload.order?.orderID;
    const netopiaId = payload.payment?.ntpID;
    const netopiaStatus = payload.payment?.status;

    if (!orderNumber) {
      console.error(JSON.stringify({ event: 'ipn_error', error: 'missing_order_id' }));
      return jsonResponse(
        { errorType: 1, errorCode: 'MISSING_ORDER', errorMessage: 'Missing orderID' },
        400
      );
    }

    // Map Netopia status to our order status
    const { orderStatus, paymentStatus } = mapNetopiaStatusToOrderStatus(netopiaStatus);

    console.log(JSON.stringify({ event: 'ipn_status_mapped', order: orderNumber, netopiaStatus, orderStatus, paymentStatus }));

    // Update order in database (Supabase)
    try {
      await updateOrderPaymentStatus(orderNumber, orderStatus, {
        paymentStatus,
        paymentReference: netopiaId,
        paidAt: paymentStatus === 'paid' ? new Date().toISOString() : undefined,
      });
      console.log(JSON.stringify({ event: 'ipn_order_updated', order: orderNumber, orderStatus, paymentStatus }));
    } catch (dbError) {
      console.error(JSON.stringify({ event: 'ipn_db_error', order: orderNumber, error: dbError instanceof Error ? dbError.message : 'Unknown error' }));
      // Don't fail the IPN response - Netopia needs confirmation
    }

    // Send confirmation emails if payment succeeded
    if (paymentStatus === 'paid') {
      try {
        const order = await getOrderByNumber(orderNumber);
        if (order) {
          const emailResults = await sendOrderConfirmationEmails(order);
          console.log(JSON.stringify({ event: 'ipn_emails_sent', order: orderNumber, customer: emailResults.customerEmail.success, admin: emailResults.adminEmail.success }));
        } else {
          console.error(JSON.stringify({ event: 'ipn_order_not_found', order: orderNumber }));
        }
      } catch (emailError) {
        console.error(JSON.stringify({ event: 'ipn_email_error', order: orderNumber, error: emailError instanceof Error ? emailError.message : 'Unknown error' }));
      }
    }

    // Return success response to Netopia
    // Netopia expects this specific response format
    return jsonResponse({
      errorType: 0,
      errorCode: '',
      errorMessage: 'OK',
    });
  } catch (error) {
    console.error(JSON.stringify({ event: 'ipn_error', error: error instanceof Error ? error.message : 'Unknown error' }));

    // Return error response to Netopia
    return jsonResponse(
      { errorType: 1, errorCode: 'SERVER_ERROR', errorMessage: 'Internal server error' },
      500
    );
  }
};

// Also support GET for testing/health check
export const GET: APIRoute = async () => {
  return jsonResponse({
    status: 'IPN endpoint active',
    netopiaConfigured: isNetopiaConfigured(),
  });
};
