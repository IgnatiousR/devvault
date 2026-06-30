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
import { emailStyles } from "./email-styles";

interface ForgotPasswordEmailProps {
  url: string;
}

export function ForgotPasswordEmail({ url }: ForgotPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your DevVault password</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Heading style={emailStyles.h1}>Reset Your Password</Heading>
          <Text style={emailStyles.text}>
            We received a request to reset the password for your DevVault
            account. Click the button below to choose a new password.
          </Text>
          <Text style={emailStyles.buttonWrapper}>
            <Link href={url} style={emailStyles.button}>
              Reset Password
            </Link>
          </Text>
          <Text style={emailStyles.text}>
            If you didn&apos;t request a password reset, you can safely ignore
            this email. Your password will remain unchanged.
          </Text>
          <Text style={emailStyles.footer}>
            This reset link will expire in 1 hour.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
