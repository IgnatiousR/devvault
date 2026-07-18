# Stripe Integration Plan — DevVault Pro

## Summary

This document provides a comprehensive implementation plan for integrating Stripe subscriptions into DevVault using the official `@better-auth/stripe` plugin. The plan covers the complete lifecycle from schema design to production deployment, including entitlement management, feature gating, billing UX, and security considerations.

**Key Decisions:**
- Use the official `@better-auth/stripe` plugin (recommended)
- Keep `user.isPro` as a denormalized cache field updated by webhook hooks
- Database-backed subscription records as the authoritative source of truth
- Centralized entitlement API for server-side feature gating

---

## Scope and Method

### Evidence Sources

- Repository inspection: `package.json`, `prisma/schema.prisma`, `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/app/api/auth/[...all]/route.ts`, `src/actions/shared.ts`, `src/proxy.ts`
- Database helpers: `src/lib/db/items.ts`, `src/lib/db/collections.ts`
- Settings UI: `src/components/settings/settings-content.tsx`
- Route handlers: `src/app/api/upload/route.ts`, `src/app/api/items/[id]/route.ts`
- Environment files: `.env`, `.env.production`
- External documentation: Better Auth Stripe plugin docs, Stripe API documentation

### Methodology

1. Inspected all authentication, schema, and route handler files
2. Mapped existing user fields and their current usage
3. Evaluated `@better-auth/stripe` plugin compatibility
4. Designed entitlement management and feature gating strategy
5. Planned billing UX and settings integration
6. Documented security requirements and testing strategy

---

## Findings

### 1. Current Authentication State

**File: `src/lib/auth.ts`**

```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => { /* ... */ },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => { /* ... */ },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  plugins: [nextCookies()],
});
```

**Key observations:**
- Better Auth uses database-backed sessions (not JWT)
- Sessions are stored in the `session` table with `expiresAt` and `updateAge`
- `nextCookies()` plugin handles cookie management
- No `user.additionalFields` configured yet
- No Stripe plugin installed

**File: `src/lib/auth-client.ts`**

```typescript
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export const {
  signIn, signOut, useSession, signUp,
  sendVerificationEmail, verifyEmail,
  requestPasswordReset, resetPassword,
} = authClient;
```

**Key observations:**
- Client has basic auth methods exported
- No `stripeClient` plugin configured
- No subscription management methods available

**File: `src/app/api/auth/[...all]/route.ts`**

```typescript
const { GET, POST: OriginalPOST } = toNextJsHandler(auth);

export async function POST(request: Request) {
  // Rate limiting logic for auth endpoints
  // Clones request for body parsing when needed
  return OriginalPOST(request);
}
```

**Critical finding:** The POST handler clones the request for rate limiting:
```typescript
const cloned = request.clone();
const body = await cloned.json();
```

This means the original request body is preserved for Better Auth. **Stripe webhooks will work correctly** because:
1. The webhook body is not mutated
2. The original request is passed to `OriginalPOST`
3. Better Auth's Stripe plugin handles webhook verification internally

**File: `src/actions/shared.ts`**

```typescript
export async function getSessionUserId(): Promise<
  | { userId: string }
  | { success: false; error: string }
> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  return { userId: session.user.id };
}
```

**File: `src/proxy.ts`**

```typescript
const GUEST_ONLY_ROUTES = ["/login", "/register", "/forgot-password"];

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirects authenticated users away from guest-only routes
  // Redirects unauthenticated users to login for protected routes
}

export const config = {
  matcher: ["/dashboard/:path*", "/items/:path*", "/favorites", "/profile", "/settings", "/login", "/register", "/forgot-password"],
};
```

**Note:** The matcher may need to include `/api/stripe/webhook` if Better Auth's Stripe plugin uses a different path.

---

### 2. Current User and Subscription Schema

**File: `prisma/schema.prisma`**

```prisma
model user {
  id            String   @id @default(cuid())
  email         String   @unique
  emailVerified Boolean  @default(false)
  name          String?
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  isPro                Boolean @default(false)
  stripeCustomerId     String? @unique
  stripeSubscriptionId String? @unique
  editorPreferences    Json?   @default("{}")

  accounts      account[]
  sessions      session[]
  items         item[]
  collections   collection[]
  itemTypes     itemType[]
  authenticator authenticator[]
}
```

**Field Analysis:**

| Field | Current State | Recommendation | Rationale |
|-------|---------------|----------------|-----------|
| `isPro` | `Boolean @default(false)` | Keep as cache field | Fast lookups, updated by webhook hooks |
| `stripeCustomerId` | `String? @unique` | Keep, plugin will use | Already compatible with plugin |
| `stripeSubscriptionId` | `String? @unique` | Migrate and remove | Plugin uses its own `subscription` model |

**Better Auth Stripe Plugin Schema:**

The plugin creates these models:
- `subscription` - stores subscription records
- `plan` - stores plan definitions

The plugin expects `stripeCustomerId` on the user model (already exists).

**Migration Strategy:**

1. Run `npx auth generate` to generate plugin schema
2. Review generated `subscription` and `plan` models
3. Create Prisma migration
4. Backfill existing `stripeSubscriptionId` data into `subscription` table
5. Remove `stripeSubscriptionId` from user model

---

### 3. Better Auth Stripe Plugin Evaluation

**Plugin: `@better-auth/stripe`**

**Installation:**
```bash
npm install @better-auth/stripe stripe
```

**Server Plugin Configuration (`src/lib/auth.ts`):**

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { prisma } from "./prisma";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      isPro: {
        type: "boolean",
        defaultValue: false,
        input: false, // Users cannot set this themselves
      },
    },
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
        onSubscriptionComplete: async ({ subscription, plan }) => {
          // Update user.isPro = true
          await prisma.user.update({
            where: { id: subscription.referenceId },
            data: { isPro: true },
          });
        },
        onSubscriptionCancel: async ({ subscription }) => {
          // Update user.isPro = false when subscription ends
          await prisma.user.update({
            where: { id: subscription.referenceId },
            data: { isPro: false },
          });
        },
        onSubscriptionDeleted: async ({ subscription }) => {
          await prisma.user.update({
            where: { id: subscription.referenceId },
            data: { isPro: false },
          });
        },
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});
```

**Client Plugin Configuration (`src/lib/auth-client.ts`):**

```typescript
import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    stripeClient({
      subscription: true,
    }),
  ],
});

export const {
  signIn, signOut, useSession, signUp,
  sendVerificationEmail, verifyEmail,
  requestPasswordReset, resetPassword,
  subscription, // New: subscription management methods
} = authClient;
```

**Webhook Endpoint:**

The plugin automatically creates `/api/auth/stripe/webhook` endpoint.

**Webhook Verification:**

Better Auth's Stripe plugin handles webhook signature verification internally using the `stripeWebhookSecret` configuration.

**Lifecycle Hooks:**

| Hook | When Called | Use Case |
|------|------------|----------|
| `onSubscriptionComplete` | Checkout success | Activate Pro access |
| `onSubscriptionCreated` | External subscription | Sync subscription state |
| `onSubscriptionUpdate` | Subscription changes | Handle plan changes |
| `onSubscriptionCancel` | Cancellation requested | Schedule deactivation |
| `onSubscriptionDeleted` | Subscription ended | Deactivate Pro access |

**Race Condition Handling:**

The plugin handles checkout/webhook race conditions by:
1. Using Stripe Checkout's intermediate success redirect
2. Processing webhooks idempotently
3. Storing subscription state in database (not just cache)

---

### 4. Entitlement Source of Truth

**Recommended Approach: Hybrid (Option A + Option B)**

**Primary Source:** Subscription record in Better Auth's `subscription` table
**Cache Field:** `user.isPro` for fast lookups

**Rationale:**

1. **Subscription record is authoritative** - reflects actual Stripe state
2. **`isPro` cache enables fast checks** - avoids query on every request
3. **Webhook hooks keep cache in sync** - `onSubscriptionComplete`/`onSubscriptionDeleted` update `isPro`
4. **Reconciliation possible** - can rebuild `isPro` from subscription records

**Entitlement Lookup:**

```typescript
// src/lib/entitlements.ts
import { prisma } from "./prisma";

export interface Entitlements {
  isPro: boolean;
  maxItems: number;
  maxCollections: number;
  maxFileUploads: boolean;
  aiAccess: boolean;
  customItemTypes: boolean;
  exportEnabled: boolean;
}

const FREE_TIER: Entitlements = {
  isPro: false,
  maxItems: 50,
  maxCollections: 3,
  maxFileUploads: false,
  aiAccess: false,
  customItemTypes: false,
  exportEnabled: false,
};

const PRO_TIER: Entitlements = {
  isPro: true,
  maxItems: Infinity,
  maxCollections: Infinity,
  maxFileUploads: true,
  aiAccess: true,
  customItemTypes: true,
  exportEnabled: true,
};

export async function getUserEntitlements(userId: string): Promise<Entitlements> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.isPro ? PRO_TIER : FREE_TIER;
}

export async function requirePro(userId: string): Promise<void> {
  const entitlements = await getUserEntitlements(userId);
  if (!entitlements.isPro) {
    throw new Error("Pro subscription required");
  }
}

export async function assertWithinFreeTier(
  userId: string,
  resource: "items" | "collections"
): Promise<void> {
  const entitlements = await getUserEntitlements(userId);
  if (entitlements.isPro) return; // Pro users have no limits

  if (resource === "items") {
    const count = await prisma.item.count({ where: { userId } });
    if (count >= entitlements.maxItems) {
      throw new Error("Free tier item limit reached. Upgrade to Pro for unlimited items.");
    }
  }

  if (resource === "collections") {
    const count = await prisma.collection.count({ where: { userId } });
    if (count >= entitlements.maxCollections) {
      throw new Error("Free tier collection limit reached. Upgrade to Pro for unlimited collections.");
    }
  }
}
```

**Cancellation-at-Period-End Behavior:**

When a user cancels:
1. Stripe sets `cancel_at_period_end = true`
2. Better Auth webhook receives `customer.subscription.updated`
3. Plugin calls `onSubscriptionUpdate` hook
4. User retains Pro access until period end
5. At period end, `onSubscriptionDeleted` fires
6. `user.isPro` set to `false`

**Drift Prevention:**

- Weekly reconciliation job compares `user.isPro` with active subscriptions
- Admin tool to manually trigger re-sync
- Logging when `isPro` is updated by webhook

---

### 5. Better Auth Session and Client Refresh Strategy

**Better Auth Session Behavior:**

- Sessions are database-backed (not JWT)
- `auth.api.getSession({ headers })` queries the database
- Session data includes user fields (including `additionalFields`)
- No `cookieCache` enabled in current config

**Client Refresh Strategy:**

After checkout success, the client needs to reflect updated Pro status:

```typescript
// src/app/settings/billing/success/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function BillingSuccessPage() {
  const router = useRouter();
  const { refetch } = useSession();

  useEffect(() => {
    // Re-fetch session to get updated user data
    refetch().then(() => {
      // Redirect to settings after session is refreshed
      router.push("/settings?upgraded=true");
    });
  }, [refetch, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Processing your upgrade...</h1>
        <p className="text-muted-foreground">Please wait while we activate your Pro subscription.</p>
      </div>
    </div>
  );
}
```

**Alternative: Dedicated Billing Status Endpoint**

```typescript
// src/app/api/billing/status/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserEntitlements } from "@/lib/entitlements";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entitlements = await getUserEntitlements(session.user.id);
  return NextResponse.json(entitlements);
}
```

**Why This Works:**

1. Database-backed sessions always reflect current state
2. `refetch()` triggers fresh session query
3. No JWT synchronization needed
4. Server-side entitlement checks are authoritative

---

### 6. Feature Gating Analysis

**Current Free-Tier Limits (from project documentation):**
- 50 items
- 3 collections

**Pro-Only Features:**
- File uploads (images and files)
- AI features (if implemented)
- Custom item types
- Export functionality
- Unlimited items and collections

**Feature Gate Locations:**

| Feature | File | Current Gate | Required Gate |
|---------|------|--------------|---------------|
| Item creation | `src/actions/items.ts:116` | None | `assertWithinFreeTier(userId, "items")` |
| Collection creation | `src/actions/collections.ts:34` | None | `assertWithinFreeTier(userId, "collections")` |
| File upload | `src/app/api/upload/route.ts:7` | Auth only | `requirePro(userId)` |
| Custom item types | `src/app/api/items/[id]/route.ts` | Auth only | `requirePro(userId)` |
| Export | N/A (not implemented) | N/A | `requirePro(userId)` |
| AI features | N/A (not implemented) | N/A | `requirePro(userId)` |

**Race-Safe Enforcement:**

```typescript
// Transaction-based limit enforcement
export async function createItemWithLimit(
  userId: string,
  data: CreateItemData
): Promise<ItemDetail | null> {
  return prisma.$transaction(async (tx) => {
    // Check limit within transaction
    const count = await tx.item.count({ where: { userId } });
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { isPro: true },
    });

    if (!user?.isPro && count >= 50) {
      throw new Error("Free tier item limit reached");
    }

    // Create item
    return createItem(userId, data);
  });
}
```

---

### 7. Settings and Billing UX

**Current Settings Page:**

`src/components/settings/settings-content.tsx` contains:
- Editor Preferences section
- Account Actions section (Change Password, Delete Account)

**Billing Section to Add:**

```typescript
// src/components/settings/billing-section.tsx
"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {Spinner} from "@/components/ui/spinner";

export function BillingSection() {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const user = session?.user;
  const isPro = user?.isPro ?? false;

  const handleUpgrade = async (annual: boolean) => {
    setIsLoading(true);
    try {
      const { subscription } = await import("@/lib/auth-client");
      await subscription.upgrade({
        plan: "pro",
        successUrl: `${window.location.origin}/settings/billing/success`,
        cancelUrl: `${window.location.origin}/settings?canceled=true`,
        annual,
      });
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const { subscription } = await import("@/lib/auth-client");
      const { data } = await subscription.billingPortal({
        returnUrl: `${window.location.origin}/settings`,
      });
      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to open billing portal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return <Spinner />;
  }

  return (
    <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Billing & Subscription
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Current Plan</p>
            <p className="text-sm text-muted-foreground">
              {isPro ? "DevVault Pro" : "Free Tier"}
            </p>
          </div>
          <Badge variant={isPro ? "default" : "secondary"}>
            {isPro ? "Pro" : "Free"}
          </Badge>
        </div>

        {isPro ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>You have access to all Pro features:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Unlimited items and collections</li>
                <li>File uploads (images and documents)</li>
                <li>AI-powered features</li>
                <li>Custom item types</li>
                <li>Export functionality</li>
              </ul>
            </div>
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={isLoading}
            >
              Manage Subscription
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Monthly</CardTitle>
                  <CardDescription>$8/month</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(false)}
                    disabled={isLoading}
                  >
                    Upgrade Monthly
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary transition-colors border-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Annual</CardTitle>
                  <CardDescription>$72/year (Save 25%)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(true)}
                    disabled={isLoading}
                  >
                    Upgrade Annual
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Free Tier Limits:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>50 items</li>
                <li>3 collections</li>
                <li>No file uploads</li>
                <li>No AI features</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
```

---

### 8. API, Server Action, and Error Patterns

**Existing Patterns:**

1. **Server Actions:** Use `"use server"` directive, Zod validation, `getSessionUserId()` helper
2. **Route Handlers:** Use `auth.api.getSession({ headers })` for auth
3. **Validation:** `validateWithFieldErrors()` and `validateSimple()` from `@/lib/action-utils`
4. **Error Returns:** `{ success: false, error: string }` or `{ success: false, fieldErrors: Record<string, string> }`
5. **Revalidation:** `revalidatePath()` after mutations

**Stripe Error Handling:**

```typescript
// src/actions/billing.ts
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserEntitlements } from "@/lib/entitlements";

interface BillingResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function createCheckoutSession(
  annual: boolean
): Promise<BillingResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check for existing active subscription
    const entitlements = await getUserEntitlements(session.user.id);
    if (entitlements.isPro) {
      return { success: false, error: "Already subscribed to Pro" };
    }

    // Use Better Auth client to create checkout
    // This is handled by the plugin's /subscription/upgrade endpoint
    return { success: true, url: "/api/auth/subscription/upgrade" };
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return { success: false, error: "Failed to create checkout session" };
  }
}

export async function openBillingPortal(): Promise<BillingResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Use Better Auth client to create portal session
    return { success: true, url: "/api/auth/subscription/billing-portal" };
  } catch (error) {
    console.error("Portal creation failed:", error);
    return { success: false, error: "Failed to open billing portal" };
  }
}
```

**Error Handling Checklist:**

| Scenario | Handling |
|----------|----------|
| Unauthenticated checkout | Return 401, redirect to login |
| Duplicate checkout | Check existing subscription, return friendly error |
| Active subscription | Return "already subscribed" message |
| Invalid webhook signature | Reject with 400 |
| Missing Stripe prices | Validate env vars at startup |
| Canceled checkout | Redirect to cancel URL |
| Stripe API failure | Log error, return user-friendly message |
| Database failure after Stripe | Log for manual reconciliation |

---

### 9. Environment Variables

**Current Variables (from `.env`):**

```bash
# Better Auth
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"

# Stripe (already configured)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_ID_MONTHLY="price_..."
STRIPE_PRICE_ID_YEARLY="price_..."
```

**Required Additional Variables:**

```bash
# Stripe (rename for clarity)
STRIPE_SECRET_KEY="sk_test_..." # Server-only
STRIPE_PUBLISHABLE_KEY="pk_test_..." # Safe for browser
STRIPE_WEBHOOK_SECRET="whsec_..." # Server-only
STRIPE_PRO_MONTHLY_PRICE_ID="price_..." # Server-only
STRIPE_PRO_ANNUAL_PRICE_ID="price_..." # Server-only

# Better Auth
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000" # Safe for browser
BETTER_AUTH_SECRET="..." # Server-only
```

**Variable Classification:**

| Variable | Server Only | Browser Safe | Dev | Preview | Production |
|----------|-------------|--------------|-----|---------|------------|
| `STRIPE_SECRET_KEY` | Yes | No | Required | Required | Required |
| `STRIPE_PUBLISHABLE_KEY` | No | Yes | Required | Required | Required |
| `STRIPE_WEBHOOK_SECRET` | Yes | No | Required | Required | Required |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Yes | No | Required | Required | Required |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | Yes | No | Required | Required | Required |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | No | Yes | Required | Required | Required |
| `BETTER_AUTH_SECRET` | Yes | No | Required | Required | Required |

**Security Notes:**
- Never expose `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` via `NEXT_PUBLIC_*`
- Use different webhook secrets for test and production modes
- Price IDs are safe to expose but should be server-only for consistency

---

### 10. Security Review

**Server-Side Authorization:**

```typescript
// All Pro features must check entitlements server-side
export async function requireProFeature(userId: string): Promise<void> {
  const entitlements = await getUserEntitlements(userId);
  if (!entitlements.isPro) {
    throw new Error("Pro subscription required");
  }
}
```

**Webhook Signature Verification:**

Better Auth's Stripe plugin handles this internally:
- Uses `stripeWebhookSecret` configuration
- Verifies `Stripe-Signature` header
- Rejects invalid signatures with 400

**Preventing User Self-Modification:**

```typescript
// In Better Auth config
user: {
  additionalFields: {
    isPro: {
      type: "boolean",
      defaultValue: false,
      input: false, // Users cannot set this
    },
  },
},
```

**Additional Security Measures:**

1. **Validate redirect URLs:** Only allow same-origin redirects
2. **Idempotent webhooks:** Better Auth handles duplicate event IDs
3. **Rate limiting:** Existing auth rate limits apply to checkout
4. **Logging:** Log subscription events without sensitive data
5. **No client-side price IDs:** Server determines prices from env vars

---

## Recommendations

### 1. Recommended Architecture

**Entitlement Source of Truth:** Database-backed subscription records
**Cache Field:** `user.isPro` updated by webhook hooks
**Feature Gating:** Centralized `getUserEntitlements()` API
**Session Refresh:** Database-backed sessions with `refetch()` on client

**Data Flow:**

```
1. User clicks "Upgrade"
2. Client calls authClient.subscription.upgrade()
3. Better Auth creates Stripe Checkout session
4. User completes checkout on Stripe
5. Stripe redirects to success URL
6. Client calls refetch() to update session
7. Stripe sends webhook to /api/auth/stripe/webhook
8. Better Auth processes webhook, updates subscription table
9. Lifecycle hook updates user.isPro = true
10. Subsequent requests see updated entitlements
```

### 2. Dependencies

**Add:**
```bash
npm install @better-auth/stripe stripe
```

**Retain:**
- `better-auth` (core)
- `@prisma/client` (database)
- `zod` (validation)

**Remove:** None

### 3. Files to Create

| Path | Purpose | Exported API |
|------|---------|--------------|
| `src/lib/entitlements.ts` | Centralized entitlement checks | `getUserEntitlements()`, `requirePro()`, `assertWithinFreeTier()` |
| `src/lib/stripe-config.ts` | Stripe client initialization | `stripeClient` |
| `src/actions/billing.ts` | Billing server actions | `createCheckoutSession()`, `openBillingPortal()` |
| `src/components/settings/billing-section.tsx` | Billing UI component | `BillingSection` |
| `src/app/settings/billing/success/page.tsx` | Checkout success page | Default export |
| `src/app/settings/billing/cancel/page.tsx` | Checkout cancel page | Default export |
| `src/lib/__tests__/entitlements.test.ts` | Entitlement tests | N/A |
| `src/actions/__tests__/billing.test.ts` | Billing action tests | N/A |

### 4. Files to Modify

| Path | Current Behavior | Change |
|------|------------------|--------|
| `package.json` | No Stripe dependencies | Add `@better-auth/stripe`, `stripe` |
| `prisma/schema.prisma` | Custom `stripeSubscriptionId` field | Remove after migration |
| `src/lib/auth.ts` | Basic Better Auth config | Add Stripe plugin, `user.additionalFields` |
| `src/lib/auth-client.ts` | Basic client | Add `stripeClient` plugin |
| `src/actions/items.ts` | No limit checks | Add `assertWithinFreeTier()` |
| `src/actions/collections.ts` | No limit checks | Add `assertWithinFreeTier()` |
| `src/app/api/upload/route.ts` | Auth only | Add `requirePro()` |
| `src/components/settings/settings-content.tsx` | No billing section | Add `BillingSection` |
| `src/proxy.ts` | Basic auth routing | May need webhook path exclusion |
| `.env` | Missing webhook secret | Add `STRIPE_WEBHOOK_SECRET` |
| `.env.production` | Missing webhook secret | Add `STRIPE_WEBHOOK_SECRET` |

### 5. Prisma Migration Plan

**Step 1: Generate Plugin Schema**
```bash
npx auth generate
```

**Step 2: Review Generated Schema**

The plugin will generate `subscription` and `plan` models. Review and merge with existing schema.

**Step 3: Create Migration**
```bash
npx prisma migrate dev --name add-stripe-subscriptions
```

**Step 4: Backfill Data**

```sql
-- Migrate existing stripeSubscriptionId to subscription table
INSERT INTO subscriptions (id, userId, stripeId, status, plan, periodStart, periodEnd, createdAt, updatedAt)
SELECT 
  gen_random_uuid(),
  u.id,
  u.stripeSubscriptionId,
  'active',
  'pro',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
FROM users u
WHERE u.stripeSubscriptionId IS NOT NULL;
```

**Step 5: Remove Old Field**
```bash
npx prisma migrate dev --name remove-stripe-subscription-id
```

**Rollback Strategy:**
1. Keep backup of `stripeSubscriptionId` data
2. Document rollback migration
3. Test on staging before production

### 6. Stripe Dashboard Setup

**Product Creation:**
1. Go to Stripe Dashboard > Products
2. Click "Add Product"
3. Name: "DevVault Pro"
4. Add prices:
   - Monthly: $8/month
   - Annual: $72/year (with 25% discount)

**Customer Portal:**
1. Go to Settings > Customer Portal
2. Enable subscription management
3. Allow plan changes
4. Configure return URL

**Webhook Endpoint:**
1. Go to Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/auth/stripe/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

**Test Mode:**
- Use test API keys
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/auth/stripe/webhook`

**Production Mode:**
- Use production API keys
- Set production webhook secret
- Verify webhook endpoint

### 7. Testing Checklist

**Unit Tests:**
- [ ] Entitlement lookup with active subscription
- [ ] Entitlement lookup with canceled subscription
- [ ] Entitlement lookup with past-due subscription
- [ ] Free-tier limit enforcement
- [ ] Pro-user unlimited access

**Server Action Tests:**
- [ ] Checkout session creation
- [ ] Billing portal creation
- [ ] Unauthenticated checkout attempt
- [ ] Duplicate checkout prevention

**Webhook Tests:**
- [ ] Valid webhook signature
- [ ] Invalid webhook signature rejection
- [ ] Duplicate webhook handling
- [ ] Out-of-order event handling
- [ ] Subscription created event
- [ ] Subscription updated event
- [ ] Subscription deleted event

**Integration Tests:**
- [ ] End-to-end checkout flow
- [ ] Subscription upgrade flow
- [ ] Cancellation flow
- [ ] Restoration flow
- [ ] Annual/monthly plan switching

**E2E Tests:**
- [ ] Checkout from settings page
- [ ] Checkout from limit prompt
- [ ] Success page redirect
- [ ] Cancel page redirect
- [ ] Billing portal access

**Free-Tier Tests:**
- [ ] Item limit enforcement (50 items)
- [ ] Collection limit enforcement (3 collections)
- [ ] Concurrent limit enforcement
- [ ] File upload restriction
- [ ] AI feature restriction

### 8. Implementation Order

**Phase 1: Schema and Dependencies**
1. Install `@better-auth/stripe` and `stripe`
2. Run `npx auth generate`
3. Review and merge schema
4. Create and run migration
5. **Validation:** `npx prisma migrate status` shows clean

**Phase 2: Better Auth Stripe Plugin**
1. Update `src/lib/auth.ts` with Stripe plugin
2. Update `src/lib/auth-client.ts` with `stripeClient`
3. Configure webhook endpoint
4. **Validation:** Auth server starts without errors

**Phase 3: Entitlement Service**
1. Create `src/lib/entitlements.ts`
2. Write unit tests
3. **Validation:** `npm test` passes

**Phase 4: Server-Side Feature Gates**
1. Update `src/actions/items.ts`
2. Update `src/actions/collections.ts`
3. Update `src/app/api/upload/route.ts`
4. **Validation:** Free-tier limits enforced

**Phase 5: Checkout and Billing Portal**
1. Create `src/actions/billing.ts`
2. Create success/cancel pages
3. **Validation:** Checkout flow works in Stripe test mode

**Phase 6: Settings UI**
1. Create `src/components/settings/billing-section.tsx`
2. Update settings page
3. **Validation:** Billing section displays correctly

**Phase 7: Tests and Webhook Verification**
1. Write all unit and integration tests
2. Test webhook handling with Stripe CLI
3. **Validation:** All tests pass

**Phase 8: Migration/Backfill**
1. Run backfill script
2. Verify existing users
3. **Validation:** No data loss

**Phase 9: Production Rollout**
1. Deploy to staging
2. Test with real Stripe test mode
3. Deploy to production
4. Configure production webhooks
5. **Validation:** Production checkout works

### 9. Open Questions and Decisions

| Question | Recommendation | Status |
|----------|----------------|--------|
| Should `trialing` users receive full Pro access? | Yes, for conversion optimization | Pending |
| Grace period for `past_due`? | 3 days, then revoke access | Pending |
| Immediate vs end-of-period downgrades? | End-of-period for UX | Pending |
| Does `isPro` remain? | Yes, as cache field | Decided |
| Import existing Stripe customers? | Manual migration script | Pending |
| Refund behavior? | Immediate revocation | Pending |
| Account deletion for active subscribers? | Cancel subscription first | Pending |
| Annual/monthly switching? | Immediate with proration | Pending |
| Checkout from limit prompts? | Yes, for conversion | Pending |

---

## Sources

1. Better Auth Stripe Plugin Documentation: https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/stripe.mdx
2. Better Auth Session Management: https://github.com/better-auth/better-auth/blob/main/docs/content/docs/concepts/session-management.mdx
3. Better Auth Additional Fields: https://github.com/better-auth/better-auth/blob/main/docs/content/docs/concepts/typescript.mdx
4. Stripe Checkout Documentation: https://stripe.com/docs/payments/checkout
5. Stripe Billing Portal: https://stripe.com/docs/billing/customer-portal
6. Stripe Webhooks: https://stripe.com/docs/webhooks
7. Repository Files: `package.json`, `prisma/schema.prisma`, `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/app/api/auth/[...all]/route.ts`, `src/actions/shared.ts`, `src/proxy.ts`
