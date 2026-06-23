# Current Feature

## Status
<!-- Not Started|In Progress|Completed -->

## Goals
<!-- Goals & requirements -->

## References
- @context/features/database-spec.md
- @context/project-overview.md
- @context/coding-standards.md
- Prisma docs: https://prisma.io/docs
- Prisma 7 upgrade guide: https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
- Prisma Postgres quickstart: https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres

## Notes
<!-- Any extra notes -->
- Neon PostgreSQL with serverless driver
- Prisma 7 has breaking changes - must review upgrade guide
- Development and production branches for database
- Always create migrations, never push directly unless specified

## History
<!-- Keep this updated. Earliest to latest -->
- **Phase 1 Completed**: Built dashboard layout, TopBar component, updated global styles, and resolved existing underlying type errors to achieve a stable build.
- **Phase 2 Completed**: Implemented collapsible sidebar, updated item links to use `/items/TYPE` routing, added "Favorites" and "Recent Collections" sections leveraging mock data, made the sidebar drawer trigger always visible, and verified user avatar placement.
- **Phase 3 Completed**: Added 4 dynamic stats cards at the top of the main area, implemented the "Pinned Items" section, updated "Recent Collections" display, expanded "Recent Items" to show up to 10 entries, and refined mock data and typings to support these new features.
- **Phase 4 Completed**: Prisma 7 schema with all data models + BetterAuth models (Account, Session, VerificationToken, Authenticator), driver adapter config, seed script, and `.env.example` created. Prisma client generated successfully. Ran initial migration, seeded database, and created test-db script.
