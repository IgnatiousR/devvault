# Email/Password Authentication (Better Auth + Prisma 7)

## Overview

Implement email/password authentication using **Better Auth**, **Prisma ORM 7**, and **Next.js App Router**.

This implementation should:

* Enable Better Auth Email & Password authentication
* Continue supporting GitHub OAuth
* Use the Better Auth Prisma adapter
* Use Prisma 7 best practices
* Use the Better Auth generated authentication endpoints
* Avoid custom password hashing and authentication logic

---

# Requirements

## Better Auth Configuration

Enable Email & Password authentication.

```ts
// lib/auth.ts

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  trustedOrigins: [
    process.env.BETTER_AUTH_URL!,
  ],
});
```

GitHub OAuth must continue working alongside Email & Password authentication.

---

## Prisma 7

Use the official Prisma 7 Client.

Requirements:

* Prisma ORM v7
* Prisma Client v7
* Better Auth Prisma Adapter
* Prisma Postgres

Do **not** implement custom password hashing.

Better Auth automatically hashes and verifies passwords.

---

## Prisma Schema

Generate the Better Auth schema using the CLI.

```bash
npx @better-auth/cli generate
```

Ensure the schema includes the required Better Auth models:

* User
* Session
* Account
* Verification

If these models already exist, update them instead of recreating them.

Run migrations afterwards:

```bash
npx prisma migrate dev
npx prisma generate
```

---

## Database

Use the Prisma adapter.

```ts
database: prismaAdapter(db, {
  provider: "postgresql",
})
```

No custom Prisma authentication queries should be implemented.

---

## Authentication API

Expose the Better Auth handler.

```
app/api/auth/[...all]/route.ts
```

```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

Do **not** create custom authentication endpoints.

Better Auth automatically exposes:

```
POST /api/auth/sign-up/email

POST /api/auth/sign-in/email

POST /api/auth/sign-out

GET /api/auth/session
```

along with the GitHub OAuth routes.

---

## Client

Create:

```
lib/auth-client.ts
```

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
```

Use the exported client throughout the application.

---

## Registration

Register users using Better Auth.

```ts
await authClient.signUp.email({
  name,
  email,
  password,
});
```

Do **not**:

* hash passwords
* compare passwords manually
* create users directly through Prisma
* create a custom `/api/auth/register` endpoint

Better Auth automatically:

* validates input
* hashes the password
* creates the user
* creates a session (if configured)
* returns structured errors

---

## Login

Authenticate users with:

```ts
await authClient.signIn.email({
  email,
  password,
});
```

Do **not** implement custom password validation.

---

## Logout

```ts
await authClient.signOut();
```

---

## Session

Use the Better Auth session helpers.

Client:

```ts
const { data: session } = authClient.useSession();
```

Server:

```ts
await auth.api.getSession({
  headers: await headers(),
});
```

Use Better Auth session APIs instead of custom session handling.

---

## GitHub OAuth

GitHub OAuth must continue functioning alongside Email & Password authentication.

Existing OAuth users should continue to sign in without modification.

---

# Validation

Validate registration with:

* Name is required
* Email is valid
* Password meets minimum length requirements
* Display Better Auth validation errors to the user

Do **not** duplicate validation already provided by Better Auth unless required for UI/UX.

---

# Testing

## Register

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@test.com",
    "password":"password123"
  }'
```

---

## Login

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@test.com",
    "password":"password123"
  }'
```

---

## Verify

1. Register a new user
2. Verify the user exists in Prisma Studio
3. Verify the password is stored as a secure hash
4. Sign in using email/password
5. Verify a session is created
6. Verify redirect to `/dashboard`
7. Verify GitHub OAuth still works
8. Verify sign out removes the session
9. Verify authenticated routes require a valid session

---

# Acceptance Criteria

* Email & Password authentication enabled
* GitHub OAuth continues to work
* Prisma 7 configured correctly
* Better Auth Prisma adapter configured
* Better Auth schema generated
* Database migrated successfully
* Authentication routes exposed
* Registration works
* Login works
* Logout works
* Sessions work on both client and server
* No custom authentication logic
* No manual bcrypt usage
* No custom registration endpoint
* Follows Better Auth recommended architecture

---

# Notes

## Differences from Auth.js

| Auth.js Credentials          | Better Auth               |
| ---------------------------- | ------------------------- |
| Credentials Provider         | Built-in Email & Password |
| `authorize()` callback       | Not used                  |
| Manual bcrypt hashing        | Built-in                  |
| Custom registration route    | Not required              |
| Manual password verification | Built-in                  |
| Custom session management    | Built-in                  |

---

# References

* Prisma ORM 7 Documentation
* Prisma 7 Upgrade Guide
* Prisma Postgres Quickstart
* Better Auth Documentation
* Better Auth Prisma Integration
* Better Auth Prisma Adapter
* Better Auth GitHub Provider
* Prisma + Better Auth + Next.js Guide
