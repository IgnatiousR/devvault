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

interface VerificationEmailProps {
  url: string;
}

export function VerificationEmail({ url }: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for DevVault</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Heading style={emailStyles.h1}>Verify Your Email</Heading>
          <Text style={emailStyles.text}>
            Thanks for signing up for DevVault! Please click the button below
            to verify your email address.
          </Text>
          <Text style={emailStyles.buttonWrapper}>
            <Link href={url} style={emailStyles.button}>
              Verify Email Address
            </Link>
          </Text>
          <Text style={emailStyles.footer}>
            If you didn&apos;t create an account, you can safely ignore this email.
          </Text>
          <Text style={emailStyles.footer}>
            This verification link will expire in 24 hours.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
