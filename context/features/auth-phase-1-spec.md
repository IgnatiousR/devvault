# Auth Setup - Better Auth + GitHub Provider (Prisma v7)

## Overview

Set up Better Auth with the Prisma adapter and GitHub OAuth using Prisma ORM v7. Use Better Auth's built-in authentication flow for testing and protect authenticated routes using Next.js 16 Proxy.

## Requirements

* Install Better Auth
* Install the Better Auth Prisma adapter
* Configure GitHub OAuth
* Use Prisma ORM v7
* Protect `/dashboard/*` routes using Next.js 16 Proxy
* Redirect unauthenticated users to the sign-in page
* Use server-side session validation

## Packages

```bash
npm install better-auth
npm install @prisma/client
npm install @better-auth/prisma
npm install prisma -D
```

## Files to Create

1. `src/lib/auth.ts` - Better Auth configuration
2. `src/app/api/auth/[...all]/route.ts` - Better Auth API handler
3. `src/lib/auth-client.ts` - Client instance
4. `src/proxy.ts` - Route protection with redirect logic
5. `src/lib/prisma.ts` - Prisma client singleton (Prisma v7 compatible)

## Better Auth Configuration

* Configure Better Auth with:

  * GitHub provider
  * Prisma adapter
  * Secure session management
* Export the auth instance from `src/lib/auth.ts`
* Export the client instance from `src/lib/auth-client.ts`

## Prisma v7 Considerations

Use the Prisma v7 project structure and recommendations.

### Prisma Client Output

Prisma v7 requires specifying an output path for the generated client.

Example:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

Update imports throughout the project accordingly:

```ts
import { PrismaClient } from "@/generated/prisma";
```

### Prisma Singleton

Create a singleton client in:

```
src/lib/prisma.ts
```

to prevent multiple Prisma Client instances during development.

### Adapter

Configure Better Auth to use the Prisma Client instance from the singleton.

## GitHub OAuth

Configure the following provider:

* GitHub

Environment variables:

```env
AUTH_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

> Better Auth uses `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` by default.

## Environment Variables

```env
DATABASE_URL=

AUTH_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

BETTER_AUTH_URL=http://localhost:3000
```

For production:

```env
BETTER_AUTH_URL=https://your-domain.com
```

## Route Protection

Use the Next.js 16 Proxy file:

```
src/proxy.ts
```

Requirements:

* Validate the Better Auth session
* Protect all `/dashboard/*` routes
* Redirect unauthenticated users to the authentication page
* Allow all public routes to continue normally

Use a named export:

```ts
export function proxy() {}
```

Do **not** use a default export.

## API Route

Create:

```
src/app/api/auth/[...all]/route.ts
```

Export the Better Auth handlers from your auth configuration.

## Client Setup

Create:

```
src/lib/auth-client.ts
```

Export the Better Auth client for:

* Sign in
* Sign out
* Session access
* React hooks (if applicable)

## Session Usage

* Fetch the session on the server whenever possible.
* Use the Better Auth client on the client side.
* Avoid implementing custom JWT logic unless your application specifically requires it.

## Testing

1. Visit `/dashboard`
2. Verify you are redirected to the authentication page.
3. Click **Sign in with GitHub**.
4. Complete GitHub authentication.
5. Verify you are redirected back to `/dashboard`.
6. Refresh the page and confirm the session persists.
7. Sign out and verify `/dashboard` is protected again.

## Key Differences from NextAuth

* No split auth configuration (`auth.config.ts` / `auth.ts`) is required.
* No Prisma Adapter package from Auth.js.
* No `next-auth` package.
* No `Session` type augmentation (`next-auth.d.ts`).
* Authentication is configured through a single Better Auth instance.
* Uses Better Auth's session management instead of NextAuth JWT/session strategies.

## References

### Better Auth

* https://better-auth.com
* https://www.better-auth.com/docs
* https://www.better-auth.com/docs/integrations/prisma
* https://www.better-auth.com/docs/authentication/github

### Prisma ORM v7

* https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7
* https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client
