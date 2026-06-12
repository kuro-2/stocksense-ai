import { Resend } from 'resend';

const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'StockSense AI <onboarding@resend.dev>';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email:noop] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
  } catch (error) {
    console.error('sendEmail error:', error);
  }
}
