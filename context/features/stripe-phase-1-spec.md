# Stripe Integration — Phase 1: Core Infrastructure

## Overview

Install and configure the Better Auth Stripe plugin, set up the subscription schema, create the entitlement service with usage-limits module, and add comprehensive unit tests. This phase establishes the foundation for Stripe integration without requiring Stripe CLI or live webhooks.

## Requirements

* Install `@better-auth/stripe` and `stripe` packages
* Configure Better Auth Stripe server plugin with plan definitions
* Configure Better Auth Stripe client plugin
* Add `user.additionalFields` for `isPro` cache field
* Run Better Auth schema generation and Prisma migration
* Create centralized entitlement service (`src/lib/entitlements.ts`)
* Create usage-limits module with free-tier enforcement
* Write unit tests for entitlements and usage-limits
* Create Stripe client configuration helper
* Update environment variable documentation

## Packages

```bash
npm install @better-auth/stripe stripe
```

**Retain:** `better-auth`, `@prisma/client`, `zod`

**Remove:** None

## Files to Create

1. `src/lib/stripe-config.ts` — Stripe client initialization
2. `src/lib/entitlements.ts` — Centralized entitlement checks
3. `src/lib/usage-limits.ts` — Free-tier limit enforcement
4. `src/lib/__tests__/entitlements.test.ts` — Entitlement unit tests
5. `src/lib/__tests__/usage-limits.test.ts` — Usage-limits unit tests

## Files to Modify

1. `package.json` — Add dependencies
2. `prisma/schema.prisma` — Add Stripe plugin models (via `npx auth generate`)
3. `src/lib/auth.ts` — Add Stripe plugin, `user.additionalFields`
4. `src/lib/auth-client.ts` — Add `stripeClient` plugin
5. `.env` — Add Stripe environment variables
6. `.env.production` — Add Stripe environment variables

## Better Auth Stripe Plugin Configuration

### Server Plugin (`src/lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { prisma } from "./prisma";
import {
  sendEmail,
  generateVerificationEmailHtml,
  generateForgotPasswordEmailHtml,
} from "./email";

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
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
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
```

### Client Plugin (`src/lib/auth-client.ts`)

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
  signIn,
  signOut,
  useSession,
  signUp,
  sendVerificationEmail,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  subscription,
} = authClient;
```

## Stripe Client Configuration

### `src/lib/stripe-config.ts`

```typescript
import Stripe from "stripe";

export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export const STRIPE_PRO_MONTHLY_PRICE_ID = process.env.STRIPE_PRO_MONTHLY_PRICE_ID!;
export const STRIPE_PRO_ANNUAL_PRICE_ID = process.env.STRIPE_PRO_ANNUAL_PRICE_ID!;
```

## Entitlement Service

### `src/lib/entitlements.ts`

```typescript
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

export async function isProUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });
  return user?.isPro ?? false;
}
```

## Usage-Limits Module

### `src/lib/usage-limits.ts`

```typescript
import { prisma } from "./prisma";
import { getUserEntitlements } from "./entitlements";

export interface UsageStatus {
  items: { current: number; limit: number; percentage: number };
  collections: { current: number; limit: number; percentage: number };
}

export async function getUsageStatus(userId: string): Promise<UsageStatus> {
  const [entitlements, itemCount, collectionCount] = await Promise.all([
    getUserEntitlements(userId),
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
  ]);

  return {
    items: {
      current: itemCount,
      limit: entitlements.maxItems,
      percentage: entitlements.maxItems === Infinity ? 0 : (itemCount / entitlements.maxItems) * 100,
    },
    collections: {
      current: collectionCount,
      limit: entitlements.maxCollections,
      percentage: entitlements.maxCollections === Infinity ? 0 : (collectionCount / entitlements.maxCollections) * 100,
    },
  };
}

export async function canCreateItem(userId: string): Promise<boolean> {
  const entitlements = await getUserEntitlements(userId);
  if (entitlements.isPro) return true;

  const count = await prisma.item.count({ where: { userId } });
  return count < entitlements.maxItems;
}

export async function canCreateCollection(userId: string): Promise<boolean> {
  const entitlements = await getUserEntitlements(userId);
  if (entitlements.isPro) return true;

  const count = await prisma.collection.count({ where: { userId } });
  return count < entitlements.maxCollections;
}

export async function assertWithinItemLimit(userId: string): Promise<void> {
  const allowed = await canCreateItem(userId);
  if (!allowed) {
    throw new Error("Free tier item limit reached (50 items). Upgrade to Pro for unlimited items.");
  }
}

export async function assertWithinCollectionLimit(userId: string): Promise<void> {
  const allowed = await canCreateCollection(userId);
  if (!allowed) {
    throw new Error("Free tier collection limit reached (3 collections). Upgrade to Pro for unlimited collections.");
  }
}

export async function requireProForFeature(userId: string, feature: "fileUpload" | "ai" | "customItemTypes" | "export"): Promise<void> {
  const entitlements = await getUserEntitlements(userId);

  const featureMap: Record<string, keyof typeof entitlements> = {
    fileUpload: "maxFileUploads",
    ai: "aiAccess",
    customItemTypes: "customItemTypes",
    export: "exportEnabled",
  };

  const entitlementKey = featureMap[feature];
  if (entitlementKey && !entitlements[entitlementKey]) {
    throw new Error(`Pro subscription required for ${feature}`);
  }
}
```

## Unit Tests

### `src/lib/__tests__/entitlements.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { getUserEntitlements, requirePro, isProUser } from "../entitlements";
import { prisma } from "@/lib/prisma";

const mockFindUnique = vi.mocked(prisma.user.findUnique);

describe("getUserEntitlements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns free tier for non-pro user", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      isPro: false,
    } as never);

    const entitlements = await getUserEntitlements("user-1");

    expect(entitlements.isPro).toBe(false);
    expect(entitlements.maxItems).toBe(50);
    expect(entitlements.maxCollections).toBe(3);
    expect(entitlements.maxFileUploads).toBe(false);
    expect(entitlements.aiAccess).toBe(false);
    expect(entitlements.customItemTypes).toBe(false);
    expect(entitlements.exportEnabled).toBe(false);
  });

  it("returns pro tier for pro user", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      isPro: true,
    } as never);

    const entitlements = await getUserEntitlements("user-1");

    expect(entitlements.isPro).toBe(true);
    expect(entitlements.maxItems).toBe(Infinity);
    expect(entitlements.maxCollections).toBe(Infinity);
    expect(entitlements.maxFileUploads).toBe(true);
    expect(entitlements.aiAccess).toBe(true);
    expect(entitlements.customItemTypes).toBe(true);
    expect(entitlements.exportEnabled).toBe(true);
  });

  it("throws when user not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(getUserEntitlements("nonexistent")).rejects.toThrow("User not found");
  });
});

describe("requirePro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not throw for pro user", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      isPro: true,
    } as never);

    await expect(requirePro("user-1")).resolves.not.toThrow();
  });

  it("throws for non-pro user", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      isPro: false,
    } as never);

    await expect(requirePro("user-1")).rejects.toThrow("Pro subscription required");
  });
});

describe("isProUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true for pro user", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      isPro: true,
    } as never);

    expect(await isProUser("user-1")).toBe(true);
  });

  it("returns false for non-pro user", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      isPro: false,
    } as never);

    expect(await isProUser("user-1")).toBe(false);
  });

  it("returns false when user not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    expect(await isProUser("nonexistent")).toBe(false);
  });
});
```

### `src/lib/__tests__/usage-limits.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      count: vi.fn(),
    },
    collection: {
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../entitlements", () => ({
  getUserEntitlements: vi.fn(),
}));

import {
  getUsageStatus,
  canCreateItem,
  canCreateCollection,
  assertWithinItemLimit,
  assertWithinCollectionLimit,
  requireProForFeature,
} from "../usage-limits";
import { prisma } from "@/lib/prisma";
import { getUserEntitlements } from "../entitlements";

const mockItemCount = vi.mocked(prisma.item.count);
const mockCollectionCount = vi.mocked(prisma.collection.count);
const mockGetEntitlements = vi.mocked(getUserEntitlements);

describe("getUsageStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct usage for free tier user", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockItemCount.mockResolvedValue(25);
    mockCollectionCount.mockResolvedValue(2);

    const status = await getUsageStatus("user-1");

    expect(status.items.current).toBe(25);
    expect(status.items.limit).toBe(50);
    expect(status.items.percentage).toBe(50);
    expect(status.collections.current).toBe(2);
    expect(status.collections.limit).toBe(3);
    expect(status.collections.percentage).toBeCloseTo(66.67, 1);
  });

  it("returns zero percentage for pro tier user", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: true,
      maxItems: Infinity,
      maxCollections: Infinity,
      maxFileUploads: true,
      aiAccess: true,
      customItemTypes: true,
      exportEnabled: true,
    });
    mockItemCount.mockResolvedValue(100);
    mockCollectionCount.mockResolvedValue(20);

    const status = await getUsageStatus("user-1");

    expect(status.items.current).toBe(100);
    expect(status.items.limit).toBe(Infinity);
    expect(status.items.percentage).toBe(0);
    expect(status.collections.current).toBe(20);
    expect(status.collections.limit).toBe(Infinity);
    expect(status.collections.percentage).toBe(0);
  });
});

describe("canCreateItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true for pro user regardless of count", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: true,
      maxItems: Infinity,
      maxCollections: Infinity,
      maxFileUploads: true,
      aiAccess: true,
      customItemTypes: true,
      exportEnabled: true,
    });

    expect(await canCreateItem("user-1")).toBe(true);
  });

  it("returns true when under limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockItemCount.mockResolvedValue(49);

    expect(await canCreateItem("user-1")).toBe(true);
  });

  it("returns false when at limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockItemCount.mockResolvedValue(50);

    expect(await canCreateItem("user-1")).toBe(false);
  });

  it("returns false when over limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockItemCount.mockResolvedValue(51);

    expect(await canCreateItem("user-1")).toBe(false);
  });
});

describe("canCreateCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true for pro user regardless of count", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: true,
      maxItems: Infinity,
      maxCollections: Infinity,
      maxFileUploads: true,
      aiAccess: true,
      customItemTypes: true,
      exportEnabled: true,
    });

    expect(await canCreateCollection("user-1")).toBe(true);
  });

  it("returns true when under limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockCollectionCount.mockResolvedValue(2);

    expect(await canCreateCollection("user-1")).toBe(true);
  });

  it("returns false when at limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockCollectionCount.mockResolvedValue(3);

    expect(await canCreateCollection("user-1")).toBe(false);
  });
});

describe("assertWithinItemLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not throw when under limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockItemCount.mockResolvedValue(49);

    await expect(assertWithinItemLimit("user-1")).resolves.not.toThrow();
  });

  it("throws when at limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockItemCount.mockResolvedValue(50);

    await expect(assertWithinItemLimit("user-1")).rejects.toThrow("Free tier item limit reached");
  });

  it("does not throw for pro user", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: true,
      maxItems: Infinity,
      maxCollections: Infinity,
      maxFileUploads: true,
      aiAccess: true,
      customItemTypes: true,
      exportEnabled: true,
    });

    await expect(assertWithinItemLimit("user-1")).resolves.not.toThrow();
  });
});

describe("assertWithinCollectionLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not throw when under limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockCollectionCount.mockResolvedValue(2);

    await expect(assertWithinCollectionLimit("user-1")).resolves.not.toThrow();
  });

  it("throws when at limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockCollectionCount.mockResolvedValue(3);

    await expect(assertWithinCollectionLimit("user-1")).rejects.toThrow("Free tier collection limit reached");
  });
});

describe("requireProForFeature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not throw for pro user", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: true,
      maxItems: Infinity,
      maxCollections: Infinity,
      maxFileUploads: true,
      aiAccess: true,
      customItemTypes: true,
      exportEnabled: true,
    });

    await expect(requireProForFeature("user-1", "fileUpload")).resolves.not.toThrow();
    await expect(requireProForFeature("user-1", "ai")).resolves.not.toThrow();
    await expect(requireProForFeature("user-1", "customItemTypes")).resolves.not.toThrow();
    await expect(requireProForFeature("user-1", "export")).resolves.not.toThrow();
  });

  it("throws for free tier user on pro features", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });

    await expect(requireProForFeature("user-1", "fileUpload")).rejects.toThrow("Pro subscription required for fileUpload");
    await expect(requireProForFeature("user-1", "ai")).rejects.toThrow("Pro subscription required for ai");
    await expect(requireProForFeature("user-1", "customItemTypes")).rejects.toThrow("Pro subscription required for customItemTypes");
    await expect(requireProForFeature("user-1", "export")).rejects.toThrow("Pro subscription required for export");
  });
});
```

## Schema Migration

### Step 1: Generate Plugin Schema

```bash
npx auth generate
```

This generates `subscription` and `plan` models required by the Stripe plugin.

### Step 2: Review Generated Schema

Review the generated schema and merge with existing `prisma/schema.prisma`. The plugin will add:

```prisma
model subscription {
  id              String   @id
  userId          String
  user            user     @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeId        String?  @unique
  plan            String
  status          String
  periodStart     DateTime
  periodEnd       DateTime
  canceledAt      DateTime?
  cancelAtPeriodEnd Boolean @default(false)
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}
```

### Step 3: Create Migration

```bash
npx prisma migrate dev --name add-stripe-subscriptions
```

### Step 4: Backfill Data (if existing subscriptions)

```sql
INSERT INTO subscriptions (id, "userId", "stripeId", plan, status, "periodStart", "periodEnd", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  u.id,
  u."stripeSubscriptionId",
  'pro',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
FROM "user" u
WHERE u."stripeSubscriptionId" IS NOT NULL;
```

### Step 5: Remove Old Field (after verification)

```bash
npx prisma migrate dev --name remove-stripe-subscription-id
```

## Environment Variables

### `.env` (Development)

```bash
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_MONTHLY_PRICE_ID="price_..."
STRIPE_PRO_ANNUAL_PRICE_ID="price_..."

# Better Auth
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

### `.env.production`

```bash
# Stripe (use production keys)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_MONTHLY_PRICE_ID="price_..."
STRIPE_PRO_ANNUAL_PRICE_ID="price_..."

# Better Auth
NEXT_PUBLIC_BETTER_AUTH_URL="https://devvault-eight.vercel.app"
```

## Validation

After completing Phase 1:

1. **Dependencies installed:** `npm ls @better-auth/stripe stripe` shows packages
2. **Schema generated:** `npx prisma migrate status` shows clean
3. **Auth server starts:** `npm run dev` without errors
4. **Unit tests pass:** `npm test` passes all entitlement and usage-limits tests
5. **TypeScript compiles:** `npx tsc --noEmit` passes

## Testing

Run unit tests:

```bash
npm test
```

Expected test results:
- `getUserEntitlements` — free tier, pro tier, user not found
- `requirePro` — pro user passes, non-pro throws
- `isProUser` — true, false, user not found
- `getUsageStatus` — free tier usage, pro tier usage
- `canCreateItem` — pro user, under limit, at limit, over limit
- `canCreateCollection` — pro user, under limit, at limit
- `assertWithinItemLimit` — under limit, at limit, pro user
- `assertWithinCollectionLimit` — under limit, at limit
- `requireProForFeature` — pro user all features, free tier all features

## References

### Better Auth Stripe Plugin

* https://better-auth.com/docs/plugins/stripe
* https://github.com/better-auth/better-auth/blob/main/docs/content/docs/plugins/stripe.mdx

### Stripe API

* https://stripe.com/docs/api
* https://stripe.com/docs/billing/subscriptions

### Prisma

* https://www.prisma.io/docs/orm/prisma-migrate
