import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { stripe } from "@better-auth/stripe";
import { stripeClient } from "./stripe-config";
import { prisma } from "./prisma";
import {
  sendEmail,
  generateVerificationEmailHtml,
  generateForgotPasswordEmailHtml,
} from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      isPro: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your DevVault password",
        react: generateForgotPasswordEmailHtml(url),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your email address",
        react: generateVerificationEmailHtml(url),
      });
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      prompt: "login",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  plugins: [
    nextCookies(),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: "pro",
            priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
            annualDiscountPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
            limits: {
              items: Infinity,
              collections: Infinity,
              fileUploads: Infinity,
            },
          },
        ],
        onSubscriptionComplete: async ({ subscription }) => {
          const { prisma: db } = await import("./prisma");
          await db.user.update({
            where: { id: subscription.referenceId },
            data: { isPro: true },
          });
        },
        onSubscriptionCancel: async ({ subscription }) => {
          const { prisma: db } = await import("./prisma");
          await db.user.update({
            where: { id: subscription.referenceId },
            data: { isPro: false },
          });
        },
        onSubscriptionDeleted: async ({ subscription }) => {
          const { prisma: db } = await import("./prisma");
          await db.user.update({
            where: { id: subscription.referenceId },
            data: { isPro: false },
          });
        },
      },
    }),
  ],
});
