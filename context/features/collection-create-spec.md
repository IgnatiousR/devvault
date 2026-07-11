# Collection Create

## Overview

Add new collections via a modal dialog. Opens from "New Collection" button in top bar.

## Requirements

- Use shadcn Dialog component
- Fields:
  - Name (required)
  - Description (optional)
- Server action `createCollectionAction` with Zod validation
- Query function `createCollection` in `lib/db/collections.ts`
- Toast on success, close modal and refresh
- Collections are user-scoped (userId from session)
