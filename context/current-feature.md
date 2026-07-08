# Current Feature

## Status
<!-- Not Started | In Progress | Completed -->
Completed

## Goals
<!-- Goals & requirements -->
- Create MarkdownEditor component with tabbed interface (Write/Preview)
- Replace Textarea with MarkdownEditor for notes and prompts only
- Keep CodeEditor for snippets and commands (no changes)
- Use react-markdown with remark-gfm for GitHub Flavored Markdown support
- Match existing dark theme styling (bg-[#1e1e1e] container, bg-[#2d2d2d] header)
- Add copy button in header (same style as CodeEditor)
- Support both display (readonly) and edit modes
- In readonly mode, only show Preview tab
- In edit mode, default to Write tab with Preview available
- Headings, code blocks, inline code, lists, blockquotes, links, tables styled properly
- Use custom CSS class (.markdown-preview) for reliable dark mode styling
- Fluid height with max 400px, matching CodeEditor behavior

## References
- @context/features/auth-phase-1-spec.md
- @context/features/auth-phase-2-spec.md
- @context/features/auth-phase-3-spec.md
- @context/features/stats-sidebar-spec.md
- @context/features/database-spec.md
- @context/features/seed-spec.md
- @context/features/dashboard-items-spec.md
- @context/features/profile-spec.md
- @context/features/rate-limiting-spec.md
- @context/features/item-list-view-spec.md
- @context/features/item-drawer-spec.md
- @context/features/item-drawer-edit-spec.md
- @context/features/item-create-spec.md
- @context/features/code-editor-spec.md
- @context/features/markdown-editor-spec.md
- @context/project-overview.md
- @context/coding-standards.md
- Prisma docs: https://prisma.io/docs
- Prisma 7 upgrade guide: https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
- Prisma Postgres quickstart: https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres
- Better Auth docs: https://www.better-auth.com/docs
- Better Auth Prisma integration: https://www.better-auth.com/docs/integrations/prisma
- Better Auth Prisma adapter: https://better-auth.com/docs/adapters/prisma
- Better Auth GitHub provider: https://www.better-auth.com/docs/authentication/github
- Prisma + Better Auth + Next.js guide: https://www.prisma.io/docs/guides/authentication/better-auth/nextjs
- Brevo SMTP docs: https://developers.brevo.com/docs/send-a-transactional-email
- nodemailer docs: https://nodemailer.com/about/
- React Email render: https://react.email/docs/render

## Notes
<!-- Any extra notes -->
- Better Auth uses catch-all route `/api/auth/[...all]`; rate limit by sub-path (e.g. `/sign-in.email`, `/sign-up.email`)
- Neon PostgreSQL with serverless driver (`@prisma/adapter-pg`)
- Prisma client output: `../generated/prisma`
- Development and production branches for database
- Always create migrations, never push directly unless specified
- Better Auth session management (not JWT)
- GitHub OAuth via `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` env vars
- Named export for proxy (not default export)
- Model names are lowercase (user, item, etc.) with `@@map` for table names
- Reuse existing auth files: `lib/auth.ts`, `lib/auth-client.ts`, `app/api/auth/[...all]/route.ts`
- Do NOT create new Prisma client, Better Auth client, or introduce NextAuth/Auth.js
- Use Better Auth v1.6 + Prisma 7 + Next.js 16 APIs
- Preserve existing sidebar behavior, documentation link, and dashboard data
- Create reusable initials generation helper

## History
<!-- Keep this updated. Earliest to latest -->
- **Phase 1 Completed**: Built dashboard layout, TopBar component, updated global styles, and resolved existing underlying type errors to achieve a stable build.
- **Phase 2 Completed**: Implemented collapsible sidebar, updated item links to use `/items/TYPE` routing, added "Favorites" and "Recent Collections" sections leveraging mock data, made the sidebar drawer trigger always visible, and verified user avatar placement.
- **Phase 3 Completed**: Added 4 dynamic stats cards at the top of the main area, implemented the "Pinned Items" section, updated "Recent Collections" display, expanded "Recent Items" to show up to 10 entries, and refined mock data and typings to support these new features.
- **Phase 4 Completed**: Prisma 7 schema with all data models + BetterAuth models (Account, Session, VerificationToken, Authenticator), driver adapter config, seed script, and `.env.example` created. Prisma client generated successfully. Ran initial migration, seeded database, and created test-db script.
- **Phase 5 Completed**: Updated seed data to use Material Symbols icon names instead of emojis. Added full seed data per seed-spec.md: demo user with bcryptjs auth, 5 collections, 18 items across snippet/prompt/command/link types, 44 tags. Updated test-db.ts to display all seeded data. Installed bcryptjs + @types/btypes.
- **Phase 6 Completed**: Dashboard collections now fetch real data from Neon database via Prisma. Created `src/lib/db/collections.ts` with `getCollectionsWithStats()` query. Converted dashboard page to async server component. Collection card border color now derived from most-used item type. Type icons display dynamically from database.
- **Phase 7 Completed**: Replaced dummy item data with real data from Neon database via Prisma. Created `src/lib/db/items.ts` with `getPinnedItems`, `getRecentItems`, and `getItemCounts` functions. Dashboard page fetches real data as an async server component. Item cards display dynamic icons/colors from database. Pinned items section conditionally renders only when present.
- **Phase 8 Completed**: Replaced sidebar mock data with real database data. Added `getItemsByTypeCount` query to fetch item types with counts. Updated sidebar to accept server data props. Added item types section with icons and counts linking to `/items/[typename]`. Added "View all collections" link under recent collections. Updated favorites and recent collections to use real DB data with colored circles based on most-used item type.
- **Phase 9 Completed**: N+1 query optimization and database index audit. Fixed duplicate `getCollectionsWithStats` call between layout and page, parallelized sequential queries in `getItemsByTypeCount`, added missing composite indexes via Prisma schema migrations (ItemCollection join table, composite indexes for filtered/sorted queries).
- **Phase 10 Completed**: Client-side data fetching with skeleton loading. Created `/api/dashboard` API route returning all dashboard data. Converted `AppSidebar` and `MainContent` to self-fetching client components using `useDashboard` hook. Added skeleton loading states. Simplified server components to render shells only (no data fetching).
- **Phase 11 Started**: Auth setup with Better Auth + GitHub Provider. Configuring Prisma v7 adapter, GitHub OAuth, route protection via Next.js 16 Proxy, and session management.
- **Phase 11 Completed**: Better Auth configured with Prisma adapter, GitHub OAuth provider, and nextCookies plugin. Created API route handler, client auth utilities, proxy-based route protection for `/dashboard/*`, and sign-in page with GitHub button. Updated `.env.example` with correct env var names.
- **Phase 12 Completed**: Email/Password authentication — updated sign-in page with email/password form, created sign-up page with registration form, added logout functionality in TopBar with user avatar dropdown, exported signUp from auth client. API route now fetches session user with isPro status. Spec: auth-phase-2-spec.md.
- **Phase 13 Started**: Auth UI overhaul — custom sign-in/register pages, sidebar user section with dropdown, Better Auth session integration. Spec: auth-phase-3-spec.md.
- **Phase 13 Completed**: Auth UI overhaul — created reusable auth components (GitHubButton, UserAvatar, SignInForm, RegisterForm, UserMenu), updated sign-in/sign-up pages to use new components, updated sidebar footer with UserMenu dropdown, updated TopBar to use UserMenu. Added accessibility features (aria-labels, keyboard navigation, loading states). Fixed register route from `/sign-up` to `/register`. Updated sidebar to display user name and email below avatar. Spec: auth-phase-3-spec.md.
- **Phase 13 Fix**: Fixed duplicate user icons in sidebar. Modified UserMenu component to accept `showUserInfo` prop. Sidebar now shows avatar, name, and email in a single clickable element that opens dropdown with Profile and Sign Out options. Removed duplicate static user info section.
- **Phase 14 Started**: Email verification on registration — using Resend for email delivery, Better Auth email verification flow, verification page, resend functionality.
- **Phase 14 Completed**: Email verification on registration — installed Resend SDK, created email utility with HTML template, configured Better Auth with email verification (requireEmailVerification: true, sendOnSignUp: true), created /verify page for token verification, updated register form to show "Check your email" state with resend button, updated sign-in form to handle 403 unverified email error with resend option, exported sendVerificationEmail and verifyEmail from auth client, updated .env.example with RESEND_API_KEY and EMAIL_FROM.
- **Phase 15 Completed**: Replaced Resend with Brevo SMTP for email delivery. Removed `resend` package, installed `nodemailer` + `@types/nodemailer`. Updated `src/lib/email.ts` to use nodemailer transport with Brevo SMTP relay (`smtp-relay.brevo.com:587`). Kept React Email template component, rendering to HTML via `@react-email/render`. Updated `.env` with Brevo SMTP credentials (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`).
- **Phase 16 Started**: Forgot/Reset password flow — Better Auth `sendResetPassword` callback, `ForgotPasswordEmail` template, `/forgot-password` and `/reset-password` pages, sign-in form "Forgot password?" link, Brevo SMTP email delivery.
- **Phase 16 Completed**: Forgot/Reset password — added `sendResetPassword` callback to Better Auth config, created `ForgotPasswordEmail` React Email template, created `/forgot-password` page with email form and success state, created `/reset-password` page with token-based new password form and validation (8+ chars, confirm match, invalid token handling), added "Forgot password?" link to sign-in form below password field, exported `requestPasswordReset` and `resetPassword` from auth client, fixed stale `.env.example` (Replaced `RESEND_API_KEY` with actual Brevo SMTP vars). Suspense boundary added for `useSearchParams()` in reset-password page.
- **Phase 17 Started**: Profile page — user info display, usage stats, change password (email users only), delete account with confirmation, protected route.
- **Phase 17 Completed**: Profile page implemented with user info (avatar, email, name, creation date, Pro badge), usage stats (total items, collections), item type breakdown with icons/colors, change password dialog (email users only), delete account alert dialog with confirmation, protected route via proxy. Created: `/profile` page, `profile-content.tsx` client component, `use-profile` hook, `/api/profile` route, `/api/profile/change-password` route, `/api/profile/delete-account` route, `dialog.tsx` and `alert-dialog.tsx` UI components, profile types and DB queries, profile skeleton. Updated proxy to protect `/profile` route.
- **Phase 18 Started**: Rate limiting on auth endpoints — Upstash Redis + `@upstash/ratelimit`, reusable utility, protection for login/register/forgot-password/reset-password/resend-verification/change-password/delete-account.
- **Phase 18 Completed**: Rate limiting implemented — created `src/lib/rate-limit.ts` with Upstash Redis sliding window limiter, added rate limiting to Better Auth catch-all route (sign-in.email, sign-up.email, forgetPassword, resetPassword, sendVerificationEmail), and custom profile routes (change-password, delete-account). Configured IP+email keyed limiting for login/resend-verification, IP-only for others. Updated `.env.example`.
- **Phase 19 Completed**: Auth page redirect for logged-in users — updated `src/proxy.ts` to redirect authenticated users from `/login`, `/register`, and `/forgot-password` to `/dashboard`. `/reset-password` left open (token-gated, not session-gated). Extended proxy matcher to cover guest-only routes.
- **Phase 20 Started**: Item list view — dynamic route /items/[type] with type-filtered items, responsive ItemCard grid, colored left borders per item type. Spec: item-list-view-spec.md.
- **Phase 20 Completed**: Item list view implemented — created `/items/[type]` dynamic route with server-side data fetching via `getItemsByType` DB query. Extracted `ItemCard` and `ListItem` into shared `src/components/items/item-card.tsx`. Created `ItemsListContent` client component with grid/list view toggle and responsive 2-column grid. Updated proxy matcher to protect `/items/:path*`. Build passes with dynamic route registered.
- **Testing Setup Completed**: Installed Vitest for unit testing server actions and utilities. Configured `vitest.config.ts` with path aliases and coverage. Added test scripts to package.json (`npm test`, `npm run test:watch`, `npm run test:coverage`). Created initial tests for validation.ts, color-utils.ts, and rate-limit.ts. Updated workflow in ai-interaction.md and coding-standards.
- **Phase 21 Started**: Item drawer — right-side slide-in detail view using shadcn Sheet, opens on ItemCard click, action bar (Favorite, Pin, Copy, Edit, Delete), client wrapper for state, fetch on click via API, skeleton loading. Spec: item-drawer-spec.md.
- **Phase 21 Completed**: Item drawer implemented — added `ItemDetail` type to `src/types/dashboard.ts`, created `getItemById` DB query in `src/lib/db/items.ts`, created `/api/items/[id]` API route with auth check, added `onItemClick` prop to `ItemCard` and `ListItem` components, created `useItemDetail` hook for client-side state management, created `ItemDrawer` component with shadcn Sheet (right-side slide-in), action bar (Favorite star, Pin, Copy, Edit, Delete), skeleton loading state, and metadata display (type, language, tags, collections). Wired up drawer in `MainContent` (dashboard) and `ItemsListContent` (items list page). TypeScript check passed. Spec: item-drawer-spec.md.
- **Phase 22 Started**: Item drawer edit mode — inline edit toggle, Save/Cancel action bar, editable fields (Title, Description, Tags, Content, Language, URL), Zod validation, server action `updateItem`, tag disconnect/reconnect on save, toast notifications. Spec: item-drawer-edit-spec.md.
- **Phase 22 Completed**: Item drawer edit mode implemented — added `UpdateItemData` interface and `updateItem` DB query function to `src/lib/db/items.ts` (disconnects all existing tags, connects/creates new ones via upsert). Created `src/actions/items.ts` with `updateItemAction` server action using Zod validation schema (title required, description/content/language nullable, url validated, tags array). Updated `ItemDrawer` component with edit mode state, form inputs for Title (inline), Description (textarea), Content (textarea for snippet/prompt/command/note), Language (input for snippet/command), URL (input for link), Tags (comma-separated input). Action bar toggles between Favorite/Pin/Copy/Edit/Delete (view mode) and Cancel/Save (edit mode). Toast notifications on save success/error. Calls `router.refresh()` after save to update card list. TypeScript check passed. Spec: item-drawer-edit-spec.md.
- **Phase 23 Started**: Item delete functionality — delete button in drawer action bar, AlertDialog confirmation, `deleteItemAction` server action, toast notifications, close drawer and refresh after delete.
- **Phase 23 Completed**: Item delete implemented — added `deleteItem` DB query function to `src/lib/db/items.ts` with ownership check. Added `deleteItemAction` server action to `src/actions/items.ts` with Zod validation. Updated `ItemDrawer` component with AlertDialog confirmation dialog (title, description, Cancel/Delete buttons), delete handler that calls server action, shows toast, closes drawer, and refreshes page. TypeScript check passed.
- **Phase 24 Started**: Item create dialog — "New Item" button in top bar opens Dialog, type selector (snippet/prompt/command/note/link), dynamic fields based on type, `createItemAction` server action, `createItem` DB function, toast on success. Spec: item-create-spec.md.
- **Phase 24 Completed**: Item create implemented — added `CreateItemData` interface and `createItem` DB function to `src/lib/db/items.ts` (upserts tags, creates item with relations). Added `createItemAction` server action to `src/actions/items.ts` with Zod validation (title required, url validated for link type, tags array). Created `src/components/dashboard/create-item-dialog.tsx` with type selector (5 types with icons), dynamic fields (title, description, content, language, url, tags), form state, loading state, and toast notifications. Updated `src/components/dashboard/top-bar.tsx` to wire "New Item" button to open dialog. TypeScript check passed. Spec: item-create-spec.md.
- **Phase 25 Started**: Code editor — Monaco Editor component for snippets/commands, dark theme, macOS window dots, copy button, language display, readonly/edit modes, fluid height with 400px max. Spec: code-editor-spec.md.
- **Phase 25 Completed**: Code editor implemented — installed `@monaco-editor/react`, created `CodeEditor` component (`src/components/ui/code-editor.tsx`) with Monaco Editor dark theme, macOS-style window dots (red/yellow/green), copy button in header, language display, readonly/edit modes, fluid height with 400px max, custom scrollbar. Integrated into `ItemDrawer` for snippets/commands (view + edit modes) and `CreateItemDialog` for snippets/commands (edit mode). Added custom scrollbar CSS to `globals.css`. Build passes. Spec: code-editor-spec.md.
- **Phase 26 Started**: Markdown editor — MarkdownEditor component with Write/Preview tabs, react-markdown + remark-gfm, dark theme styling, copy button, readonly/edit modes, custom .markdown-preview CSS. Replaces Textarea for notes and prompts. Spec: markdown-editor-spec.md.
- **Phase 26 Completed**: Markdown editor implemented — installed `react-markdown`, `remark-gfm`, and `rehype-sanitize`. Created `MarkdownEditor` component (`src/components/ui/markdown-editor.tsx`) with Write/Preview tabs, react-markdown + remark-gfm for GFM support, rehype-sanitize for XSS protection, dark theme styling matching CodeEditor, copy button in header, readonly/edit modes, fluid height with 400px max. Added comprehensive `.markdown-preview` CSS styles for dark mode (headings, code blocks, inline code, lists, blockquotes, links, tables). Integrated into `ItemDrawer` for notes/prompts (edit + view modes) and `CreateItemDialog` for notes/prompts. Snippets/commands continue using CodeEditor. Build passes. Spec: markdown-editor-spec.md.
