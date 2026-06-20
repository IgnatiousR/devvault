# DevVault – Project Overview

## 🚀 Vision

DevVault is a developer knowledge vault that centralizes snippets, prompts, notes, commands, links, files, images, AI workflows, and project context into a single searchable workspace.

Inspired by Notion, Raycast, and Linear, DevVault focuses on fast capture, retrieval, organization, and AI-assisted productivity.

---

# 🎯 Core Problem

Developers store information everywhere:

- VS Code snippets
- AI chats
- GitHub gists
- Browser bookmarks
- Terminal history
- Markdown files
- Notion pages
- Local documents

This fragmentation creates:

- Context switching
- Lost knowledge
- Duplicate work
- Poor discoverability

DevVault solves this with a unified developer-first knowledge system.

---

# 👥 Target Users

## Everyday Developers
Quick access to snippets, commands, notes, and links.

## AI-First Developers
Prompt libraries, system prompts, workflows, and context files.

## Educators & Content Creators
Reusable code examples, tutorials, documentation, and notes.

## Full-Stack Builders
Architecture patterns, API examples, templates, and references.

---

# 🏗 High-Level Architecture

```text
┌─────────────┐
│   Next.js   │
│  React 19   │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Better Auth      │
│ GitHub / Email   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Prisma ORM       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Neon PostgreSQL  │
└──────────────────┘

       │
       ├────────────► Cloudflare R2
       │              File Storage
       │
       ├────────────► OpenAI GPT-5 Nano
       │              AI Features
       │
       └────────────► Redis (Future)
                      Caching
```

---

# 🧩 System Item Types

| Type | Icon | Color |
|--------|--------|--------|
| Snippet | 💻 | #ef4444 |
| Prompt | ✨ | #f97316 |
| Command | ⌨️ | #f59e0b |
| Note | 📝 | #fde047 |
| Link | 🔗 | #10b981 |
| File | 📄 | #6b7280 |
| Image | 🖼️ | #ec4899 |

Primary Brand Color: **Red (#ef4444)**

---

# 📦 Features

## Item Management

- Create items
- Edit items
- Delete items
- Favorite items
- Pin items
- Recent items
- Markdown editor
- Syntax highlighting
- Multiple collections per item

## Collections

- Unlimited nesting later
- Favorites
- Smart organization
- Shared item references

## Search

Search across:

- Titles
- Content
- Tags
- Types
- Collections

Future:

- Semantic AI Search

## AI Features (Pro)

- Auto-tagging
- Summaries
- Explain code
- Prompt optimization

---

# 💳 Monetization

## Free

- 50 items
- 3 collections
- Basic search

## Pro ($8/mo)

- Unlimited items
- Unlimited collections
- File uploads
- Image uploads
- AI tools
- Exports

---

# 🗄 Prisma Schema (Draft)

```prisma
model User {
  id                    String @id @default(cuid())
  email                 String @unique
  name                  String?
  image                 String?

  isPro                 Boolean @default(false)

  stripeCustomerId      String?
  stripeSubscriptionId  String?

  items                 Item[]
  collections           Collection[]
  itemTypes             ItemType[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model Item {
  id            String @id @default(cuid())

  title         String
  description   String?

  content       String?
  url           String?

  fileUrl       String?
  fileName      String?
  fileSize      Int?

  language      String?

  isFavorite    Boolean @default(false)
  isPinned      Boolean @default(false)

  userId        String
  user          User @relation(fields:[userId], references:[id])

  itemTypeId    String
  itemType      ItemType @relation(fields:[itemTypeId], references:[id])

  tags          Tag[]

  collections   ItemCollection[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model ItemType {
  id          String @id @default(cuid())

  name        String
  icon        String
  color       String

  isSystem    Boolean @default(false)

  userId      String?
  user        User? @relation(fields:[userId], references:[id])

  items       Item[]
}

model Collection {
  id            String @id @default(cuid())

  name          String
  description   String?

  isFavorite    Boolean @default(false)

  userId        String
  user          User @relation(fields:[userId], references:[id])

  items         ItemCollection[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model ItemCollection {
  itemId        String
  collectionId  String

  item          Item @relation(fields:[itemId], references:[id])
  collection    Collection @relation(fields:[collectionId], references:[id])

  addedAt       DateTime @default(now())

  @@id([itemId, collectionId])
}

model Tag {
  id        String @id @default(cuid())
  name      String @unique

  items     Item[]
}
```

---

# 🔐 Authentication

## Better Auth

Providers:

- Email & Password
- GitHub OAuth

Future:

- Google OAuth
- Passkeys

---

# 📁 Routes

```text
/
/dashboard

/items
/items/snippets
/items/prompts
/items/notes
/items/commands
/items/links

/collections
/collections/[id]

/settings
/billing
```

---

# 🎨 Design System

References:

- Linear
- Notion
- Raycast

Guidelines:

- Dark Mode First
- Red Accent Color
- Minimal UI
- Fast Drawer Interactions
- Keyboard Friendly
- Developer Focused

---

# Screenshots and Demo codes

refer to screeenshots below as a base for dashboard ui.It doesnot have to exactly match the design, but should provide a good starting point.

- @context/screenshots/dashboard-ui-main.png
- @context/screenshots/dashboard-ui-drawer.png
- @context/codes/dashboard-main.html
- @context/codes/dashboard-drawer.html

# 📈 Future Roadmap

Phase 1
- Core CRUD
- Authentication
- Collections
- Search

Phase 2
- File uploads
- Billing
- AI features

Phase 3
- Semantic search
- Shared collections
- Team workspaces

Phase 4
- Browser extension
- VS Code extension
- Desktop app

---

# ⚠ Technical Rules

- Prisma migrations only
- Never use `db push`
- TypeScript everywhere
- Server Actions preferred
- R2 for file storage
- Better Auth for authentication
- Red-focused design language
