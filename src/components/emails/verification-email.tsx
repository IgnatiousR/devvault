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
} from "@react-email/components";

interface VerificationEmailProps {
  url: string;
}

export function VerificationEmail({ url }: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for DevVault</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify Your Email</Heading>
          <Text style={text}>
            Thanks for signing up for DevVault! Please click the button below
            to verify your email address.
          </Text>
          <Link href={url} style={button}>
            Verify Email Address
          </Link>
          <Text style={footer}>
            If you didn&apos;t create an account, you can safely ignore this email.
          </Text>
          <Text style={footer}>
            This verification link will expire in 24 hours.
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
  margin: "30px 0",
};

const footer = {
  fontSize: "14px",
  color: "#6b7280",
  marginTop: "16px",
};
