# Stripe Integration — Phase 2: Webhooks, Feature Gating & UI

## Overview

Implement server-side feature gating, billing server actions, webhook verification with Stripe CLI, settings UI components, and end-to-end checkout flow. This phase requires Stripe CLI for local webhook testing and builds on the core infrastructure from Phase 1.

## Prerequisites

* Phase 1 completed (dependencies installed, schema migrated, entitlements module ready)
* Stripe CLI installed (`stripe listen --forward-to localhost:3000/api/auth/stripe/webhook`)
* Stripe Dashboard configured with product, prices, and webhook endpoint
* Environment variables set (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, price IDs)

## Requirements

* Add server-side feature gates to item creation, collection creation, and file upload
* Create billing server actions (checkout, portal)
* Create checkout success/cancel pages
* Add billing section to settings UI
* Test webhook handling with Stripe CLI
* Verify signature validation and idempotency
* Add upgrade prompts when limits are reached
* Handle edge cases (duplicate checkout, active subscription, canceled checkout)

## Files to Create

1. `src/actions/billing.ts` — Billing server actions
2. `src/components/settings/billing-section.tsx` — Billing UI component
3. `src/components/settings/upgrade-prompt.tsx` — Upgrade prompt component
4. `src/app/settings/billing/success/page.tsx` — Checkout success page
5. `src/app/settings/billing/cancel/page.tsx` — Checkout cancel page
6. `src/app/api/billing/status/route.ts` — Billing status API
7. `src/actions/__tests__/billing.test.ts` — Billing action tests

## Files to Modify

1. `src/actions/items.ts` — Add `assertWithinItemLimit()` before item creation
2. `src/actions/collections.ts` — Add `assertWithinCollectionLimit()` before collection creation
3. `src/app/api/upload/route.ts` — Add `requireProForFeature(userId, "fileUpload")`
4. `src/components/settings/settings-content.tsx` — Add `BillingSection`
5. `src/proxy.ts` — Exclude webhook path from rate limiting if needed

## Server-Side Feature Gating

### Item Creation (`src/actions/items.ts`)

Add usage limit check before creating items:

```typescript
import { assertWithinItemLimit } from "@/lib/usage-limits";

export async function createItemAction(
  input: CreateItemInput
): Promise<CreateItemResult> {
  const validation = validateWithFieldErrors(createItemSchema, input);
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  // Check free-tier limit before creating
  try {
    await assertWithinItemLimit(auth.userId);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Item limit reached",
    };
  }

  const result = await createItem(auth.userId, {
    title: validation.data.title,
    description: validation.data.description ?? null,
    content: validation.data.content ?? null,
    language: validation.data.language ?? null,
    url: validation.data.url ?? null,
    fileUrl: validation.data.fileUrl ?? null,
    fileName: validation.data.fileName ?? null,
    fileSize: validation.data.fileSize ?? null,
    tags: validation.data.tags,
    itemTypeId: validation.data.itemTypeId,
    collectionIds: validation.data.collectionIds ?? [],
  });

  if (!result) return { success: false, error: "Failed to create item" };

  return { success: true, data: result };
}
```

### Collection Creation (`src/actions/collections.ts`)

Add usage limit check before creating collections:

```typescript
import { assertWithinCollectionLimit } from "@/lib/usage-limits";

export async function createCollectionAction(
  input: CreateCollectionInput
): Promise<CreateCollectionResult> {
  const validation = validateWithFieldErrors(createCollectionSchema, input);
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  // Check free-tier limit before creating
  try {
    await assertWithinCollectionLimit(auth.userId);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Collection limit reached",
    };
  }

  const result = await createCollection(auth.userId, {
    name: validation.data.name,
    description: validation.data.description ?? null,
  });

  if (!result) return { success: false, error: "Failed to create collection" };

  revalidatePath("/dashboard");

  return { success: true, data: result };
}
```

### File Upload (`src/app/api/upload/route.ts`)

Add Pro feature check before allowing uploads:

```typescript
import { requireProForFeature } from "@/lib/usage-limits";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Pro feature access
    try {
      await requireProForFeature(session.user.id, "fileUpload");
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Pro subscription required" },
        { status: 403 }
      );
    }

    // ... rest of upload logic
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
```

## Billing Server Actions

### `src/actions/billing.ts`

```typescript
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserEntitlements } from "@/lib/entitlements";
import { STRIPE_PRO_MONTHLY_PRICE_ID, STRIPE_PRO_ANNUAL_PRICE_ID } from "@/lib/stripe-config";

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

    // The actual checkout is handled by the client using authClient.subscription.upgrade()
    // This action validates preconditions and returns configuration
    return {
      success: true,
      url: `/api/auth/subscription/upgrade`,
    };
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

    // The portal is opened by the client using authClient.subscription.billingPortal()
    // This action validates preconditions
    return {
      success: true,
      url: `/api/auth/subscription/billing-portal`,
    };
  } catch (error) {
    console.error("Portal creation failed:", error);
    return { success: false, error: "Failed to open billing portal" };
  }
}

export async function getBillingStatus() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const entitlements = await getUserEntitlements(session.user.id);

    return {
      userId: session.user.id,
      email: session.user.email,
      isPro: entitlements.isPro,
      entitlements,
    };
  } catch (error) {
    console.error("Failed to get billing status:", error);
    return { error: "Failed to get billing status" };
  }
}
```

## Checkout Success/Cancel Pages

### `src/app/settings/billing/success/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { CheckCircle } from "@phosphor-icons/react";

export default function BillingSuccessPage() {
  const router = useRouter();
  const { refetch } = useSession();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const refreshSession = async () => {
      try {
        await refetch();
        setStatus("success");
        setTimeout(() => {
          router.push("/settings?upgraded=true");
        }, 2000);
      } catch (error) {
        console.error("Session refresh failed:", error);
        setStatus("error");
      }
    };

    refreshSession();
  }, [refetch, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md mx-auto p-6">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Processing your upgrade...</h1>
            <p className="text-muted-foreground">
              Please wait while we activate your Pro subscription.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Welcome to DevVault Pro!</h1>
            <p className="text-muted-foreground">
              Your subscription is now active. Redirecting to settings...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              We couldn&apos;t verify your subscription. Please contact support.
            </p>
            <button
              onClick={() => router.push("/settings")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Go to Settings
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

### `src/app/settings/billing/cancel/page.tsx`

```typescript
"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md mx-auto p-6">
        <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Checkout canceled</h1>
        <p className="text-muted-foreground mb-6">
          No worries! You can upgrade anytime from your settings.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => router.push("/settings")}>
            Back to Settings
          </Button>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Billing Status API

### `src/app/api/billing/status/route.ts`

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserEntitlements } from "@/lib/entitlements";
import { getUsageStatus } from "@/lib/usage-limits";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [entitlements, usage] = await Promise.all([
      getUserEntitlements(session.user.id),
      getUsageStatus(session.user.id),
    ]);

    return NextResponse.json({
      userId: session.user.id,
      email: session.user.email,
      isPro: entitlements.isPro,
      entitlements,
      usage,
    });
  } catch (error) {
    console.error("Failed to get billing status:", error);
    return NextResponse.json(
      { error: "Failed to get billing status" },
      { status: 500 }
    );
  }
}
```

## Billing Section UI

### `src/components/settings/billing-section.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle, Warning } from "@phosphor-icons/react";

interface UsageStatus {
  items: { current: number; limit: number; percentage: number };
  collections: { current: number; limit: number; percentage: number };
}

export function BillingSection() {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<UsageStatus | null>(null);

  const user = session?.user;
  const isPro = user?.isPro ?? false;

  useEffect(() => {
    if (user) {
      fetch("/api/billing/status")
        .then((res) => res.json())
        .then((data) => {
          if (data.usage) {
            setUsage(data.usage);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const handleUpgrade = async (annual: boolean) => {
    setIsLoading(true);
    try {
      const { subscription } = await import("@/lib/auth-client");
      await subscription.upgrade({
        plan: "pro",
        successUrl: `${window.location.origin}/settings/billing/success`,
        cancelUrl: `${window.location.origin}/settings/billing/cancel`,
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

            {usage && (
              <div className="space-y-2">
                <p className="font-medium text-sm">Current Usage</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Items</span>
                    <span>{usage.items.current} / {usage.items.limit}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(usage.items.percentage, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Collections</span>
                    <span>{usage.collections.current} / {usage.collections.limit}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(usage.collections.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

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

## Upgrade Prompt Component

### `src/components/settings/upgrade-prompt.tsx`

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "@phosphor-icons/react";

interface UpgradePromptProps {
  feature: string;
  description?: string;
}

export function UpgradePrompt({ feature, description }: UpgradePromptProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const { subscription } = await import("@/lib/auth-client");
      await subscription.upgrade({
        plan: "pro",
        successUrl: `${window.location.origin}/settings/billing/success`,
        cancelUrl: `${window.location.origin}/settings/billing/cancel`,
        annual: true,
      });
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-base">Upgrade to Pro</CardTitle>
        <CardDescription>
          {description || `${feature} is a Pro feature`}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="gap-2"
        >
          Upgrade Now
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
```

## Webhook Testing with Stripe CLI

### Setup

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop install stripe

   # Or download from https://stripe.com/docs/stripe-cli
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Start webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/auth/stripe/webhook
   ```

4. Copy the webhook signing secret (`whsec_...`) to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Test Events

Trigger test events:

```bash
# Subscription created
stripe trigger customer.subscription.created

# Subscription updated
stripe trigger customer.subscription.updated

# Subscription deleted
stripe trigger customer.subscription.deleted

# Invoice payment succeeded
stripe trigger invoice.payment_succeeded

# Invoice payment failed
stripe trigger invoice.payment_failed
```

### Verify Webhook Handling

1. Start dev server: `npm run dev`
2. Start Stripe CLI: `stripe listen --forward-to localhost:3000/api/auth/stripe/webhook`
3. Trigger events and check server logs
4. Verify database updates (subscription table, user.isPro)

### Manual Checkout Test

1. Go to `/settings`
2. Click "Upgrade Monthly" or "Upgrade Annual"
3. Complete checkout on Stripe (use test card: 4242 4242 4242 4242)
4. Verify redirect to success page
5. Verify session refresh shows Pro status
6. Verify webhook updates database

## Edge Cases

### Duplicate Checkout

```typescript
// In billing.ts or client component
const entitlements = await getUserEntitlements(userId);
if (entitlements.isPro) {
  return { success: false, error: "Already subscribed to Pro" };
}
```

### Active Subscription Upgrade

Better Auth handles this via `subscriptionId` parameter in `subscription.upgrade()`.

### Canceled Checkout

User is redirected to cancel URL. No database changes.

### Out-of-Order Webhooks

Better Auth handles this internally using subscription status and timestamps.

### Invalid Webhook Signature

Better Auth rejects with 400 status. Stripe retries automatically.

### Missing Stripe Prices

Validate at startup:
```typescript
if (!process.env.STRIPE_PRO_MONTHLY_PRICE_ID) {
  throw new Error("STRIPE_PRO_MONTHLY_PRICE_ID is required");
}
```

## Validation

After completing Phase 2:

1. **Feature gates work:** Free-tier users cannot create items/collections beyond limits
2. **File upload restricted:** Free-tier users get 403 on upload
3. **Checkout flow:** Stripe Checkout opens, completes, redirects to success
4. **Webhook processing:** Stripe CLI events update database
5. **Session refresh:** Client shows Pro status after checkout
6. **Settings UI:** Billing section displays correctly
7. **Billing portal:** Opens Stripe Customer Portal
8. **Upgrade prompts:** Display when limits reached

## Testing

### Manual Testing

1. **Free-tier limits:**
   - Create 50 items as free-tier user
   - Verify 51st item fails with limit message
   - Create 3 collections
   - Verify 4th collection fails

2. **Pro features:**
   - Upgrade to Pro
   - Verify unlimited items/collections
   - Verify file upload works
   - Verify all Pro features accessible

3. **Checkout flow:**
   - Click upgrade button
   - Complete Stripe Checkout
   - Verify success page
   - Verify session refresh
   - Verify billing section shows Pro

4. **Webhook testing:**
   ```bash
   # Terminal 1
   npm run dev

   # Terminal 2
   stripe listen --forward-to localhost:3000/api/auth/stripe/webhook

   # Terminal 3
   stripe trigger customer.subscription.created
   ```

5. **Billing portal:**
   - Click "Manage Subscription"
   - Verify Stripe portal opens
   - Make changes and verify updates

### Automated Testing

```bash
npm test
```

Expected tests:
- Billing action tests (checkout, portal, status)
- Feature gate tests (item limit, collection limit, file upload)

## Stripe Dashboard Configuration

### Product Setup

1. Go to Stripe Dashboard > Products
2. Create product: "DevVault Pro"
3. Add prices:
   - Monthly: $8/month (recurring)
   - Annual: $72/year (recurring, 25% discount)

### Customer Portal

1. Go to Settings > Customer Portal
2. Enable subscription management
3. Allow plan changes
4. Configure return URL: `https://devvault-eight.vercel.app/settings`

### Webhook Endpoint

1. Go to Developers > Webhooks
2. Add endpoint: `https://devvault-eight.vercel.app/api/auth/stripe/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy signing secret to production environment

## References

### Stripe CLI

* https://stripe.com/docs/stripe-cli
* https://stripe.com/docs/stripe-cli/webhooks

### Stripe Checkout

* https://stripe.com/docs/payments/checkout
* https://stripe.com/docs/payments/checkout/migration

### Stripe Billing Portal

* https://stripe.com/docs/billing/customer-portal

### Better Auth Stripe Plugin

* https://better-auth.com/docs/plugins/stripe
