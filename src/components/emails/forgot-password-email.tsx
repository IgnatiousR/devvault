import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "react-email";

interface ForgotPasswordEmailProps {
  url: string;
}

export function ForgotPasswordEmail({ url }: ForgotPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your DevVault password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset Your Password</Heading>
          <Text style={text}>
            We received a request to reset the password for your DevVault
            account. Click the button below to choose a new password.
          </Text>
          <Text style={buttonWrapper}>
            <Link href={url} style={button}>
              Reset Password
            </Link>
          </Text>
          <Text style={text}>
            If you didn&apos;t request a password reset, you can safely ignore
            this email. Your password will remain unchanged.
          </Text>
          <Text style={footer}>
            This reset link will expire in 1 hour.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  lineHeight: "1.6",
  color: "#333",
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "20px",
};

const h1 = {
  color: "#ef4444",
  fontSize: "28px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const text = {
  fontSize: "16px",
  marginBottom: "20px",
};

const buttonWrapper = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  display: "inline-block",
  backgroundColor: "#ef4444",
  color: "#ffffff",
  padding: "14px 32px",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: "600",
  fontSize: "16px",
  textAlign: "center" as const,
};

const footer = {
  fontSize: "14px",
  color: "#6b7280",
  marginTop: "16px",
};
