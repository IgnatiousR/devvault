import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "DevVault <noreply@resend.dev>",
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error("Failed to send email:", error);
    throw error;
  }

  return data;
}

export function generateVerificationEmailHtml(url: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
      </div>
      <div style="background: #f9fafb; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Thanks for signing up for DevVault! Please click the button below to verify your email address.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="display: inline-block; background: #ef4444; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Verify Email Address</a>
        </div>
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">If you didn't create an account, you can safely ignore this email.</p>
        <p style="font-size: 14px; color: #6b7280;">This verification link will expire in 24 hours.</p>
      </div>
      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>DevVault - Your Developer Toolkit</p>
      </div>
    </body>
    </html>
  `;
}
