# Stripe Integration Research — Better Auth

## Output

`docs/stripe-integration-plan.md`

## Research

Analyze the DevVault codebase and create a comprehensive Stripe subscription integration plan for **DevVault Pro**:

- **Monthly:** $8/month
- **Annual:** $72/year

The project uses **Better Auth**, not NextAuth/Auth.js. Base the plan on the current repository implementation and the installed Better Auth version.

Prefer the official `@better-auth/stripe` plugin unless codebase constraints make a custom Stripe integration clearly safer or simpler. If recommending a custom implementation, explain why the official plugin is unsuitable.

Repository:

- `https://github.com/IgnatiousR/devvault`

Primary documentation:

- Better Auth Stripe plugin
- Better Auth Next.js integration
- Better Auth session management
- Better Auth Prisma adapter
- Better Auth additional user fields and TypeScript inference
- Stripe Checkout, Billing Portal, subscriptions, and webhook documentation

Verify all APIs against the versions actually installed in `package.json`. Do not copy NextAuth v5 patterns into the plan.

---

## Required Analysis

### 1. Current Authentication State

Inspect and document the current Better Auth implementation, including:

- `src/lib/auth.ts`
  - `betterAuth()` configuration
  - Prisma adapter
  - `nextCookies()` plugin
  - email/password and GitHub authentication
  - session expiration and refresh behavior
- `src/lib/auth-client.ts`
  - Better Auth React client
  - exported session and authentication methods
- `src/app/api/auth/[...all]/route.ts`
  - `toNextJsHandler(auth)`
  - existing authentication rate limiting
  - whether the wrapper preserves Stripe webhook body and signature validation
- `src/actions/shared.ts`
  - server-side `auth.api.getSession({ headers })`
  - current user-ID helper
- `src/proxy.ts`
  - protected-route handling
  - whether billing or checkout result routes need matcher changes
- Every server component, server action, route handler, hook, or client component that reads the authenticated user or session

Explain how Better Auth sessions differ from the previous NextAuth JWT-session assumptions.

### 2. Current User and Subscription Schema

Inspect `prisma/schema.prisma`, especially the `user` model fields:

- `isPro`
- `stripeCustomerId`
- `stripeSubscriptionId`
- Better Auth `account`, `session`, and `verification` models

Compare the existing schema with the schema expected by `@better-auth/stripe`, including:

- `stripeCustomerId` on the user
- the plugin's `subscription` model and required fields
- indexes, uniqueness constraints, mappings, and naming compatibility
- whether the existing `stripeSubscriptionId` field becomes redundant
- whether `isPro` should remain, be removed, or become a denormalized entitlement cache

For each existing field, recommend one of:

1. Keep as the source of truth
2. Keep as a derived/cache field
3. Migrate and remove
4. Rename or remap for plugin compatibility

Include a safe migration and backfill strategy.

### 3. Better Auth Stripe Plugin Evaluation

Evaluate the official `@better-auth/stripe` plugin as the default implementation.

Cover:

- required dependencies:
  - `@better-auth/stripe`
  - `stripe`
- server plugin configuration in `src/lib/auth.ts`
- client plugin configuration in `src/lib/auth-client.ts`
- Stripe client initialization and API version handling
- `createCustomerOnSignUp`
- monthly and annual plan configuration
- `priceId` and `annualDiscountPriceId`
- subscription upgrade/checkout flow
- active subscription listing
- cancellation and restoration
- Billing Portal creation
- webhook endpoint:
  - `/api/auth/stripe/webhook`
- webhook signature verification
- checkout/webhook race-condition handling
- lifecycle hooks such as:
  - `onSubscriptionComplete`
  - `onSubscriptionCreated`
  - `onSubscriptionUpdate`
  - `onSubscriptionCancel`
  - `onSubscriptionDeleted`
- plugin-generated database fields and models
- Better Auth CLI schema generation with the Prisma adapter
- how generated schema changes should be merged and migrated using Prisma

Explicitly check whether the existing custom POST wrapper around the Better Auth route can interfere with the Stripe webhook. The webhook request body must reach Better Auth without mutation.

### 4. Entitlement Source of Truth

Recommend a clear source of truth for Pro access.

Compare these approaches:

#### Option A — Subscription record as source of truth

Derive Pro access from the Better Auth Stripe subscription record, using accepted statuses such as `active` and `trialing`.

Analyze:

- server-side subscription queries
- `auth.api.listActiveSubscriptions`
- direct Prisma queries when appropriate
- cancellation-at-period-end behavior
- past-due, unpaid, incomplete, paused, and canceled states
- webhook delay and failure behavior
- whether server actions should call a centralized entitlement helper

#### Option B — Denormalized `user.isPro`

Keep `isPro` as a fast derived field updated by subscription lifecycle hooks.

Analyze:

- how every relevant Stripe event updates it
- transaction and idempotency requirements
- reconciliation jobs or admin repair tooling
- risks of `isPro` drifting from Stripe/subscription state
- how cancellation-at-period-end should behave
- how to backfill existing users

Choose one approach and explain why it best fits DevVault.

Do not treat a client-side session value as the authoritative security boundary.

### 5. Better Auth Session and Client Refresh Strategy

Remove all NextAuth-specific JWT callback guidance.

Do **not** propose:

- NextAuth `jwt` callbacks
- `trigger === "update"`
- `useSession().update()`
- custom JWT synchronization on every validation

Instead, analyze the correct Better Auth behavior:

- Better Auth uses database-backed sessions in the current project
- server code obtains the session through `auth.api.getSession({ headers })`
- the current config does not enable Better Auth cookie session caching
- custom user fields must be configured through Better Auth `user.additionalFields` when they need to be inferred or returned
- sensitive Stripe identifiers should not be exposed to the browser unless required
- `input: false` must be used for fields users must never set themselves
- checkout success should explicitly refresh or re-fetch client-visible billing state
- the official Stripe plugin's intermediate success redirect should be used when available to avoid checkout/webhook race conditions

Determine the best client strategy for showing updated Pro status after checkout:

- re-fetch Better Auth session data
- query active subscriptions
- refresh the route/server component
- use a dedicated server action or billing-status endpoint

The implementation must remain correct even if the client UI is temporarily stale.

### 6. Feature Gating Analysis

Confirm the free-tier limits from project documentation:

- 50 items
- 3 collections

Locate every place where these limits must be enforced.

Inspect:

- item creation server actions and database helpers
- collection creation server actions and database helpers
- file upload flows
- custom item type creation
- export functionality
- AI functionality
- settings and billing UI
- any existing Pro badges, disabled controls, or upgrade prompts

Document all Pro-only capabilities:

- file uploads
- AI features
- custom item types
- export
- any additional Pro features found in the repository

Feature gates must be enforced on the server, not only hidden in the UI.

Recommend a centralized entitlement API, for example:

- `getUserEntitlements(userId)`
- `requirePro(userId)`
- `assertWithinFreeTier(userId, resource)`
- shared plan constants and typed entitlement results

Analyze race-safe enforcement for item and collection limits. Avoid a simple count-then-create pattern if concurrent requests could exceed the limit; recommend a transaction, database constraint strategy, or another defensible approach.

### 7. Settings and Billing UX

Inspect the current settings page and related components.

Plan the billing experience for:

- current plan display
- monthly/annual pricing toggle
- upgrade button
- checkout loading and error states
- checkout success and cancellation states
- subscription status
- renewal date
- cancellation-at-period-end messaging
- manage billing button
- restore subscription option
- past-due or payment-failed messaging
- feature comparison
- free-tier usage counters
- upgrade prompts when limits are reached

Specify which parts should be server components, client components, server actions, or Better Auth client calls.

### 8. API, Server Action, and Error Patterns

Document existing patterns for:

- route handlers
- server actions
- Zod validation
- authentication failures
- action result types
- `revalidatePath`
- rate limiting
- database helpers
- toast/error display

The Stripe implementation should follow existing project conventions unless there is a security reason not to.

Include handling for:

- unauthenticated checkout attempts
- duplicate checkout requests
- existing active subscriptions
- duplicate webhook delivery
- out-of-order webhook events
- invalid webhook signatures
- missing Stripe prices
- canceled checkout
- Stripe API failures
- database failures after Stripe succeeds
- subscription state reconciliation

### 9. Environment Variables

Inspect the project's environment-variable conventions and provide a complete variable list.

At minimum, evaluate:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_MONTHLY_PRICE_ID`
- `STRIPE_PRO_ANNUAL_PRICE_ID`
- `NEXT_PUBLIC_BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- application base URL variables already used by the project

State which variables are:

- server-only
- safe for the browser
- required in local development
- required in preview deployments
- required in production

Never expose the Stripe secret key or webhook secret through `NEXT_PUBLIC_*`.

### 10. Security Review

Include a focused security review covering:

- server-side authorization for all Pro features
- trusting Stripe webhook signatures
- preventing users from writing `isPro` or Stripe identifiers
- avoiding client-controlled plan or price IDs
- validating redirect URLs
- preventing open redirects
- idempotent webhook handling
- replay and duplicate event handling
- authorization of subscription reference IDs
- protecting Billing Portal creation
- avoiding leakage of Stripe customer/subscription identifiers
- preserving the raw webhook request
- rate limiting checkout creation without rate limiting legitimate Stripe webhooks
- logging without exposing personal or payment data

---

## Deliverable

Create a complete implementation plan containing:

### 1. Recommended Architecture

- chosen entitlement source of truth
- Better Auth Stripe plugin decision
- subscription lifecycle
- session/client refresh strategy
- feature-gating strategy
- data flow from checkout to entitlement activation

Include a simple sequence diagram or numbered request flow.

### 2. Dependencies

List exact packages to add, remove, or retain.

Do not remove `better-auth`.

### 3. Files to Create

For every new file, provide:

- path
- purpose
- exported API
- code example
- security considerations
- tests to add

Likely candidates may include:

- Stripe client/config helper
- centralized entitlement helper
- plan constants
- billing server actions
- billing UI components
- subscription test fixtures
- reconciliation script

Do not assume these files are necessary; justify each one.

### 4. Files to Modify

For every existing file, provide:

- path
- current behavior
- exact change
- representative code diff or replacement snippet
- migration concerns
- tests affected

At minimum, evaluate:

- `package.json`
- `prisma/schema.prisma`
- `src/lib/auth.ts`
- `src/lib/auth-client.ts`
- `src/app/api/auth/[...all]/route.ts`
- `src/actions/shared.ts`
- item and collection creation paths
- file upload paths
- custom item type paths
- export paths
- AI paths
- settings page and settings components
- protected-route configuration
- environment examples and deployment documentation

### 5. Prisma Migration Plan

Include:

- Better Auth Stripe schema generation step
- manual schema review
- Prisma migration command
- backfill steps
- safe handling of existing `stripeCustomerId`
- treatment of `stripeSubscriptionId`
- treatment of `isPro`
- rollback strategy
- production deployment order

Do not claim the Better Auth CLI can directly migrate Prisma unless verified for the installed adapter/version. Prefer schema generation followed by normal Prisma migration workflow.

### 6. Stripe Dashboard Setup

Provide exact setup steps for:

- product creation
- $8 monthly recurring price
- $72 annual recurring price
- Customer Portal configuration
- webhook endpoint
- required webhook events
- test mode
- production mode
- environment-specific webhook secrets
- copying price IDs into environment variables

### 7. Testing Checklist

Include:

- unit tests
- server-action tests
- entitlement tests
- webhook tests
- integration tests
- end-to-end checkout tests
- Stripe CLI local webhook tests
- cancellation and restoration tests
- annual/monthly plan tests
- duplicate webhook tests
- out-of-order event tests
- free-tier limit tests
- concurrent limit-enforcement tests
- unauthorized access tests
- client refresh tests
- production smoke tests

### 8. Implementation Order

Provide a dependency-aware, low-risk implementation order.

Separate work into small reviewable phases, such as:

1. schema and dependencies
2. Better Auth Stripe plugin
3. entitlement service
4. server-side feature gates
5. checkout and Billing Portal
6. settings UI
7. tests and webhook verification
8. migration/backfill
9. production rollout and monitoring

For every phase, state the validation command or test that should pass before continuing.

### 9. Open Questions and Decisions

List unresolved product or technical decisions, including:

- whether `trialing` users receive full Pro access
- grace period for `past_due`
- immediate versus end-of-period downgrades
- whether `isPro` remains
- whether existing Stripe customers must be imported
- refund behavior
- account deletion behavior for active subscribers
- whether annual/monthly switching is immediate or period-end
- whether checkout is available only from settings or also from limit prompts

---

## Required Code Examples

Include representative, version-correct examples for:

1. Better Auth Stripe server plugin configuration
2. Better Auth Stripe client plugin configuration
3. monthly and annual plan definitions
4. entitlement lookup
5. Pro-required server action
6. free-tier item or collection limit enforcement
7. checkout/upgrade action
8. Billing Portal action
9. settings billing component
10. Prisma schema changes
11. webhook/lifecycle hook behavior if `isPro` is retained
12. tests for active, canceled, and past-due subscriptions

Code examples must use the repository's existing import aliases, TypeScript conventions, Prisma client, action result patterns, and Next.js App Router architecture.

---

## Rules

- Produce documentation only.
- Do not modify application source files.
- Do not create branches or commits.
- Base findings on the current DevVault repository, not assumptions.
- Use Better Auth terminology and APIs.
- Prefer the official `@better-auth/stripe` plugin.
- Do not use NextAuth/Auth.js JWT callbacks or session-update patterns.
- Do not rely on client-side checks for authorization.
- Do not expose Stripe secrets or sensitive billing identifiers.
- Clearly label verified facts, recommendations, and unresolved questions.
- Cite relevant repository files and official documentation in the generated plan.
