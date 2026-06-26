# Current Feature: 
Auth Setup - Better Auth + GitHub Provider (Prisma v7)

## Status
<!-- Not Started|In Progress|Completed -->
Completed

## Goals
<!-- Goals & requirements -->
1. Install Better Auth and Prisma adapter packages
2. Configure Better Auth with GitHub OAuth provider
3. Set up Prisma v7 client singleton and schema
4. Create auth API route handler
5. Create client-side auth utilities
6. Protect `/dashboard/*` routes using Next.js 16 Proxy
7. Redirect unauthenticated users to sign-in page
8. Implement server-side session validation

## References
- @context/features/auth-phase-1-spec.md
- @context/features/stats-sidebar-spec.md
- @context/features/database-spec.md
- @context/features/seed-spec.md
- @context/features/dashboard-items-spec.md
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

## Notes
<!-- Any extra notes -->
- Neon PostgreSQL with serverless driver
- Prisma 7 has breaking changes - must review upgrade guide
- Development and production branches for database
- Always create migrations, never push directly unless specified
- Better Auth uses Prisma v7 with custom output path (`../src/generated/prisma`)
- Better Auth session management (not JWT)
- GitHub OAuth via `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` env vars
- Named export for proxy (not default export)

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
