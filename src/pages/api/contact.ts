import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const name = formData.get('name')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const phone = formData.get('phone')?.toString() || '';
    const subject = formData.get('subject')?.toString() || '';
    const message = formData.get('message')?.toString() || '';

    if (!name || !email || !phone || !subject || !message) {
      return redirect('/contact/failure?error=missing_fields');
    }

    const { error } = await resend.emails.send({
      from: 'Nextaz Contact <onboarding@resend.dev>',
      to: 'contact@nextaz.ro',
      replyTo: email,
      subject: `[Nextaz Contact] ${subject}`,
      html: `
        <h2>Mesaj nou de la formularul de contact</h2>
        <p><strong>Nume:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Subiect:</strong> ${subject}</p>
        <hr />
        <p><strong>Mesaj:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return redirect('/contact/failure?error=send_failed');
    }

    return redirect('/contact/success');
  } catch (error) {
    console.error('Contact form error:', error);
    return redirect('/contact/failure?error=server_error');
  }
};
