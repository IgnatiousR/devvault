import nodemailer from "nodemailer";
import { render } from "react-email";
import { VerificationEmail } from "../components/emails/verification-email";
import { ForgotPasswordEmail } from "../components/emails/forgot-password-email";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactNode;
}) {
  const html = await render(react);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}

export function generateVerificationEmailHtml(url: string) {
  return VerificationEmail({ url });
}

export function generateForgotPasswordEmailHtml(url: string) {
  return ForgotPasswordEmail({ url });
}
