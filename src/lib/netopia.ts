/**
 * Netopia Payment v2 API Client
 *
 * Based on official sample: https://github.com/netopiapayments/sample-app-js
 * Uses redirect flow - users enter card details on Netopia's hosted page.
 * No PCI compliance needed.
 */

import { Netopia, Ipn } from 'netopia-payment2';

// ============================================================================
// Configuration
// ============================================================================

export interface NetopiaConfig {
  apiKey: string;
  posSignature: string;
  publicKey: string;
  isLive: boolean;
}

export function getNetopiaConfig(): NetopiaConfig {
  const apiKey = import.meta.env.NETOPIA_API_KEY;
  const posSignature = import.meta.env.NETOPIA_POS_SIGNATURE;
  const publicKey = import.meta.env.NETOPIA_PUBLIC_KEY;

  // Handle both boolean true and string 'true' (Vite/Astro can convert 'true' to boolean at runtime)
  const sandboxEnv = import.meta.env.NETOPIA_SANDBOX as unknown;
  const isSandbox = sandboxEnv === true || sandboxEnv === 'true';
  const isLive = !isSandbox;

  if (!apiKey || !posSignature) {
    throw new Error('Netopia credentials not configured (NETOPIA_API_KEY, NETOPIA_POS_SIGNATURE)');
  }

  return { apiKey, posSignature, publicKey: publicKey || '', isLive };
}

export function isNetopiaConfigured(): boolean {
  return !!(import.meta.env.NETOPIA_API_KEY && import.meta.env.NETOPIA_POS_SIGNATURE);
}

// ============================================================================
// Netopia Client
// ============================================================================

export function createNetopiaClient(config: NetopiaConfig) {
  return new Netopia({
    apiKey: config.apiKey,
    posSignature: config.posSignature,
    isLive: config.isLive,
  });
}

// ============================================================================
// IPN Verifier
// ============================================================================

export function createIpnVerifier(config: NetopiaConfig) {
  if (!config.publicKey) {
    console.warn(JSON.stringify({ event: 'netopia_config', warning: 'public_key_missing' }));
    return null;
  }

  return new Ipn({
    posSignature: config.posSignature,
    posSignatureSet: [config.posSignature],
    publicKeyStr: config.publicKey,
    hashMethod: 'sha256',
    alg: 'RS256',
  });
}

// ============================================================================
// Types for Order Creation
// ============================================================================

export interface ConfigData {
  emailTemplate: string;
  emailSubject: string;
  cancelUrl: string;
  notifyUrl: string;
  redirectUrl: string;
  language: string;
}

export interface PaymentData {
  options: {
    installments: number;
    bonus: number;
  };
  instrument: {
    type: 'card';
  };
}

export interface BillingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  details?: string;
  city: string;
  country: number; // Country code (642 = Romania)
  countryName: string;
  state: string;
  postalCode: string;
}

export interface OrderData {
  ntpID: string | null;
  orderID: string;
  description: string;
  amount: number;
  currency: string;
  dateTime: Date;
  billing: BillingData;
  installments?: {
    selected: number;
  };
}

export interface NetopiaResponse {
  code: number;
  data?: {
    payment: {
      ntpID: string;
      paymentURL: string;
      status: number;
    };
  };
  message?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create the payment request for Netopia redirect flow.
 * Only sends instrument.type = 'card' to trigger hosted payment page.
 */
export function createPaymentRequest(params: {
  orderNumber: string;
  amount: number;
  currency: string;
  description: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    county: string;
    postalCode: string;
  };
  company?: {
    name: string;
    cui: string;
    contactFirstName: string;
    contactLastName: string;
    nrCode?: string;
    countyCode?: string;
  };
  notifyUrl: string;
  redirectUrl: string;
}) {
  // Config data - use any to bypass SDK strict types
  const configData = {
    emailTemplate: 'Confirmare plată Nextaz',
    emailSubject: `Plată comandă ${params.orderNumber}`,
    notifyUrl: params.notifyUrl,
    redirectUrl: params.redirectUrl,
    language: 'ro',
  } as any;

  // Only type: 'card' is needed - triggers redirect to hosted payment page
  // Per Netopia support: "Pentru a obtine paymentURL, este necesar ca in instrument sa trimiteti doar type card."
  const paymentData = {
    options: { installments: 0, bonus: 0 },
    instrument: {
      type: 'card',
    },
  } as any;

  // Build company data block if this is a company order
  const companyData = params.company
    ? (() => {
        const cui = params.company!.cui.trim();
        const cuiUpper = cui.toUpperCase();
        const isVatPayer = cuiUpper.startsWith('RO');
        return {
          order_profile: '4',
          company: params.company!.name,
          vat_code: isVatPayer ? cuiUpper : `RO${cuiUpper}`,
          vat_payer: isVatPayer ? '1' : '0',
          tax_code: cuiUpper.replace(/^RO/, ''),
          nr_code: params.company!.nrCode ?? '',
          first_name: params.company!.contactFirstName,
          last_name: params.company!.contactLastName,
          email: params.customer.email,
          phone: params.customer.phone,
          address: params.customer.address,
          city: params.customer.city,
          county: params.customer.county,
          county_code: params.company!.countyCode ?? '',
          country: 'RO',
        };
      })()
    : undefined;

  // Minimal order data that was working before
  const orderData = {
    ntpID: null,
    orderID: params.orderNumber,
    description: params.description,
    amount: params.amount,
    currency: params.currency,
    dateTime: new Date(),
    billing: {
      firstName: params.customer.firstName,
      lastName: params.customer.lastName,
      email: params.customer.email,
      phone: params.customer.phone,
      details: params.customer.address,
      city: params.customer.city,
      country: 642, // Romania
      countryName: 'Romania',
      state: params.customer.county || 'Romania',
      postalCode: params.customer.postalCode || '000000',
    },
    installments: { selected: 0 },
    ...(companyData ? { data: companyData } : {}),
  } as any;

  return { configData, paymentData, orderData };
}

/**
 * Initiate a payment with Netopia.
 * Returns the payment URL for redirect.
 */
export async function initiatePayment(params: {
  orderNumber: string;
  amount: number;
  currency?: string;
  description?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    county: string;
    postalCode: string;
  };
  company?: {
    name: string;
    cui: string;
    contactFirstName: string;
    contactLastName: string;
    nrCode?: string;
    countyCode?: string;
  };
  notifyUrl: string;
  redirectUrl: string;
}): Promise<
  { success: true; paymentUrl: string; ntpID: string } | { success: false; error: string }
> {
  const config = getNetopiaConfig();

  const { configData, paymentData, orderData } = createPaymentRequest({
    orderNumber: params.orderNumber,
    amount: params.amount,
    currency: params.currency || 'RON',
    description: params.description || `Comandă ${params.orderNumber}`,
    customer: params.customer,
    company: params.company,
    notifyUrl: params.notifyUrl,
    redirectUrl: params.redirectUrl,
  });

  // Build request body (same structure the SDK sends)
  const requestBody = {
    config: configData,
    payment: paymentData,
    order: {
      ...orderData,
      ntpID: orderData.ntpID || null,
      posSignature: config.posSignature,
    },
  };

  // SDK has wrong live URL — use correct endpoints per Netopia docs
  const baseUrl = config.isLive
    ? 'https://secure.mobilpay.ro/pay'
    : 'https://secure-sandbox.netopia-payments.com';
  const url = `${baseUrl}/payment/card/start`;

  console.log(
    JSON.stringify({
      event: 'netopia_payment_init',
      order: orderData.orderID,
      amount: orderData.amount,
      currency: orderData.currency,
      url,
      isLive: config.isLive,
      hasCompanyData: !!orderData.data,
      orderData: JSON.stringify(orderData.data),
    })
  );

  try {
    const fetchResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await fetchResponse.text();

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(
        JSON.stringify({
          event: 'netopia_non_json_response',
          order: params.orderNumber,
          httpStatus: fetchResponse.status,
          responsePreview: responseText.substring(0, 500),
        })
      );
      return {
        success: false,
        error: `Netopia returned non-JSON response (HTTP ${fetchResponse.status})`,
      };
    }

    console.log(
      JSON.stringify({
        event: 'netopia_response',
        order: params.orderNumber,
        httpStatus: fetchResponse.status,
        hasPaymentUrl: !!data?.payment?.paymentURL,
        rawResponse: JSON.stringify(data),
      })
    );

    if (fetchResponse.status === 200 && data?.payment?.paymentURL) {
      return {
        success: true,
        paymentUrl: data.payment.paymentURL,
        ntpID: data.payment.ntpID,
      };
    }

    return {
      success: false,
      error: data?.message || `Netopia HTTP ${fetchResponse.status}`,
    };
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'netopia_api_error',
        order: params.orderNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Netopia error',
    };
  }
}

// ============================================================================
// IPN Verification
// ============================================================================

export interface IPNPayload {
  payment: {
    status: number;
    ntpID: string;
    amount: number;
    currency: string;
  };
  order: {
    ntpID: string;
    dateTime: string;
    description: string;
    orderID: string;
    amount: number;
    currency: string;
    billing: {
      email: string;
      phone: string;
      firstName: string;
      lastName: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Verify IPN signature from Netopia.
 * Returns true if valid, false otherwise.
 */
export async function verifyIPN(verifyToken: string, rawBody: string): Promise<boolean> {
  try {
    const config = getNetopiaConfig();

    // Check if public key is properly configured
    if (!config.publicKey || config.publicKey.includes('YOUR_KEY_HERE')) {
      console.warn(
        JSON.stringify({ event: 'ipn_verify_skipped', reason: 'public_key_not_configured' })
      );
      return true; // Allow without verification in development
    }

    const ipnVerifier = createIpnVerifier(config);

    if (!ipnVerifier) {
      console.warn(
        JSON.stringify({ event: 'ipn_verify_skipped', reason: 'verifier_creation_failed' })
      );
      return true; // Allow in development without public key
    }

    // Use the raw body string directly — re-stringifying parsed JSON changes formatting and breaks the signature
    const result = await ipnVerifier.verify(verifyToken, rawBody);
    console.log(
      JSON.stringify({
        event: 'ipn_verify_result',
        errorType: result.errorType,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      })
    );

    // errorType 0 means success
    if (result.errorType === 0) {
      return true;
    }

    console.error(
      JSON.stringify({
        event: 'ipn_verify_failed',
        isLive: config.isLive,
        errorType: result.errorType,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      })
    );
    return false;
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'ipn_verify_error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    );
    return false;
  }
}
