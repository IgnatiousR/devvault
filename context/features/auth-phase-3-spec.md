````md
# Auth UI - Better Auth (Prisma 7 + Next.js 16)

## Overview

Replace the current placeholder authentication UI with a fully custom authentication experience using the existing Better Auth setup.

This project already includes:

- Next.js 16 App Router
- React 19
- Better Auth v1
- Prisma 7
- PostgreSQL
- Existing Better Auth configuration
- Existing Sidebar component

Follow the current project architecture.

Do **NOT** introduce NextAuth/Auth.js patterns.

---

# Existing Authentication

Authentication is already configured.

Reuse the existing implementation.

Files already available:

```
lib/auth.ts
lib/auth-client.ts
app/api/auth/[...all]/route.ts
```

Do NOT recreate

- Better Auth
- Prisma client
- auth handlers
- authentication providers

---

# Existing UI

The application already includes

- Sidebar
- Avatar UI component
- Tooltip provider
- Existing design system

Reuse existing components whenever possible.

Do NOT replace the current UI library.

---

# Sign In Page

Route

```
/sign-in
```

Create a custom page.

## Fields

- Email
- Password

## Buttons

- Sign In
- Continue with GitHub

## Links

- Create an account

## Validation

Validate

- valid email
- password required

Display inline validation errors.

## Authentication

Use Better Auth client APIs.

Email login

```ts
signIn.email(...)
```

GitHub login

```ts
signIn.social({
    provider: "github"
})
```

Do NOT

- call Prisma
- create custom auth routes
- POST to custom endpoints

On success

redirect to

```
/
```

or callback URL.

---

# Register Page

Route

```
/register
```

## Fields

- Name
- Email
- Password
- Confirm Password

## Buttons

- Create Account
- Continue with GitHub

## Links

Already have an account?

```
Sign In
```

## Validation

Validate

- name required
- valid email
- password minimum length
- passwords match

Display inline validation.

## Registration

Use Better Auth

```ts
signUp.email(...)
```

Do NOT

- POST to /api/auth/register
- create users with Prisma

Better Auth is responsible for creating users.

Handle

- duplicate email
- weak password
- network failure

On success

redirect to

```
/sign-in
```

unless Better Auth already creates a session.

---

# Sidebar User Section

Update the existing sidebar footer.

Do NOT rewrite the entire sidebar.

Only replace the current user section.

Preserve

- Documentation link
- collapsed sidebar behavior
- loading skeleton
- existing styling

---

# User Information

Display

- avatar
- name
- email

Example

```
John Doe
john@email.com
```

Replace the existing

```
Free
Pro
```

label with the authenticated user's email.

---

# Avatar

Reuse the existing

```
Avatar
AvatarImage
AvatarFallback
```

components.

Do NOT create another Avatar implementation.

Create a reusable helper/component that centralizes initials generation.

Rules

```
Brad Traversy

BT

John

J

John Ronald Tolkien

JT
```

Use

- first letter of first word
- first letter of last word

If only one word exists

use one letter.

If GitHub image exists

display image.

Otherwise

display initials.

---

# User Dropdown

Replace the current footer interaction.

Clicking the user row opens a dropdown.

Menu

- Profile
- Sign Out

Profile

```
/profile
```

Sign Out

Use

```ts
signOut()
```

from

```
lib/auth-client.ts
```

After sign out

redirect

```
/sign-in
```

Close when clicking outside.

---

# Session Usage

Use Better Auth as the single source of truth.

Server Components

Use

```ts
auth.api.getSession(...)
```

when appropriate.

Client Components

Use

```ts
useSession()
```

from

```
lib/auth-client.ts
```

Avoid duplicate user requests.

Do NOT introduce

```
/api/me
```

or another authentication endpoint.

---

# Existing Dashboard

The sidebar currently loads dashboard data.

Keep the existing dashboard query.

Do NOT remove

- collections
- item counts
- documentation link

Only replace the user identity portion with Better Auth session data where appropriate.

Avoid unnecessary refactoring.

---

# Protected Pages

Do NOT introduce middleware.

Use server-side session checks inside layouts/pages when protection is required.

Middleware is not required for this project.

---

# Loading State

Preserve the existing sidebar skeleton.

Avoid layout shift.

Avoid flashing logged-out UI while the session initializes.

---

# Accessibility

All forms should include

- labels
- autocomplete
- aria-invalid
- aria-describedby

Buttons should expose loading states.

Support keyboard navigation.

---

# Error Handling

Handle

- invalid credentials
- duplicate email
- OAuth failure
- expired session
- network failure

Display friendly messages.

Never expose raw Better Auth errors.

---

# Components

Create reusable components.

Suggested structure

```
components/

    auth/

        sign-in-form.tsx

        register-form.tsx

        github-button.tsx

        user-menu.tsx

        user-avatar.tsx
```

Reuse existing UI primitives whenever possible.

---

# Implementation Rules

Reuse

```
lib/auth.ts
lib/auth-client.ts
```

Do NOT

- create another Prisma client
- create another Better Auth client
- introduce NextAuth
- introduce Auth.js
- duplicate Avatar components
- duplicate authentication logic

Use the latest Better Auth APIs compatible with

- Better Auth v1.6
- Prisma 7
- Next.js 16

---

# Testing Checklist

## Sign In

- custom page renders
- email/password login works
- GitHub login works
- validation works
- loading state works
- error messages display correctly

## Register

- validation works
- passwords match
- duplicate email handled
- Better Auth creates user
- redirect works

## Sidebar

- Documentation link preserved
- avatar image displayed
- initials fallback works
- user name displayed
- email displayed
- collapsed sidebar still works

## Dropdown

- opens on click
- closes on outside click
- Profile link works
- Sign Out works

## Session

- refresh preserves session
- no hydration mismatch
- no logged-out UI flash
- authenticated UI updates correctly

---

# Success Criteria

The completed implementation should

- use the existing Better Auth configuration
- integrate cleanly with the current Sidebar
- preserve existing dashboard functionality
- avoid unnecessary architectural changes
- follow modern Better Auth + Prisma 7 patterns
- reuse existing UI components instead of creating duplicates
````
