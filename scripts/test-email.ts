import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function main() {
  console.log("Sending test email via Brevo SMTP...\n");

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: "cryfar556@gmail.com",
    subject: "DevVault — Brevo SMTP Test",
    html: `
      <h1>Hello from DevVault!</h1>
      <p>This is a test email sent via Brevo SMTP relay.</p>
      <p>If you received this, your email configuration is working correctly.</p>
    `,
  });

  console.log("Email sent successfully!");
  console.log(`  Message ID: ${info.messageId}`);
  console.log(`  Response:   ${info.response}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Failed to send email:", e);
    process.exit(1);
  });
