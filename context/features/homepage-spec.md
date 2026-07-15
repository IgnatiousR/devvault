# Homepage Spec

## Overview

Replace the current placeholder homepage (`src/app/page.tsx`) with a full marketing/landing page based on the mockup at `context/prototypes/homepage.html`. The page is public (no auth required) and serves as the entry point for new and returning users.

## Prototype Reference

- `@context/prototypes/homepage.html`

## Requirements

- Dark-themed landing page using the app's existing CSS theme (`globals.css` brand-red primary, dark mode defaults)
- Use Tailwind CSS v4 utility classes and existing ShadCN components (`Button`) where applicable
- Page split into server components (static content) and client components (interactivity)
- All buttons and links route to correct destinations
- Responsive design (mobile + desktop)
- Smooth scroll behavior for anchor links

## Sections (top to bottom)

### 1. Navbar (Client Component)

**File:** `src/components/home/navbar.tsx` (`'use client'`)

- Fixed top, transparent by default, blurred/scrolled state on scroll (use scroll listener)
- Logo: DevVault icon + "DevVault" text linking to `/`
- Desktop nav links: Features (`#features`), Pricing (`#pricing`), AI (`#ai`) — smooth scroll anchors
- Right side: "Sign In" text link to `/login`, "Get Started" button (white bg, black text) linking to `/register`
- Mobile: hamburger menu using ShadCN `Sheet` component

### 2. Hero (Server Component)

**File:** `src/components/home/hero.tsx`

- Badge: pulsing green dot + "The developer knowledge hub"
- Heading: "Stop Losing Your Developer Knowledge" with gradient text on "Developer Knowledge" (use `bg-gradient-to-r from-white via-blue-300 to-purple-400 bg-clip-text text-transparent`)
- Subheading paragraph describing the value prop
- Two CTAs:
  - "Start Free — It's Fast" primary button (gradient indigo-to-purple bg) → `/register`
  - "See How It Works" outline button → smooth scroll to `#features`
- Trust signals below: "No credit card required", "Free forever plan", "Export anytime" with green check icons

### 3. Chaos → Order Visual (Server Component)

**File:** `src/components/home/chaos-order.tsx`

- Three-column layout on desktop, stacked on mobile
- Left: "Chaos" container with floating icons representing scattered tools (Notion, GitHub, Slack, VS Code, Terminal, etc.) — static positioned icons, no physics animation needed
- Center: Animated arrow (CSS `pulse-arrow` animation via Tailwind or inline keyframes)
- Right: Dashboard preview mockup showing organized DevVault interface with item type cards (snippet, prompt, command, note, image, link) using correct type colors:
  - snippet: `#ef4444`
  - prompt: `#f97316`
  - command: `#f59e0b`
  - note: `#fde047`
  - file: `#6b7280`
  - image: `#ec4899`
  - link: `#10b981`

### 4. Features Grid (Server Component)

**File:** `src/components/home/features.tsx`

- Section heading: "Built for every kind of developer knowledge" with gradient text
- 6 feature cards in a responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Each card: icon box (colored bg/border matching type color), title, description
- Features:
  1. **Code Snippets** — color `#ef4444`, icon: code brackets
  2. **AI Prompts** — color `#f97316`, icon: sparkles/star
  3. **Instant Search** — color `#f59e0b`, icon: search/magnifier
  4. **Commands** — color `#10b981`, icon: terminal
  5. **Files & Docs** — color `#6b7280`, icon: file
  6. **Collections** — color `#6366f1`, icon: bookmark
- Cards use `group` hover: `translate-y-[-4px]` and border highlight
- Use `material-symbols-outlined` icons (already loaded in layout) or Lucide React icons

### 5. AI Section (Server Component)

**File:** `src/components/home/ai-section.tsx`

- Two-column layout on desktop, stacked on mobile
- Left side:
  - "PRO FEATURE" badge (amber tint)
  - Heading: "AI that understands your code" with gradient text
  - Description paragraph
  - 4 bullet points with green check circles: auto-generated tags, smart descriptions, related items, natural language search
  - "See Pro pricing" link → smooth scroll to `#pricing`
- Right side:
  - Code editor mockup card showing a TypeScript snippet (`useAuth.ts`)
  - AI-generated tags panel below the code with colored tag pills
  - AI description text

### 6. Pricing (Client Component)

**File:** `src/components/home/pricing.tsx` (`'use client'`)

- Section heading with gradient text
- Monthly/Yearly toggle (client state) — yearly shows "SAVE 25%" badge
- Two pricing cards:
  - **Free** ($0/forever): 50 items, 3 collections, all item types, instant search, no AI, no cloud sync. CTA → `/register`
  - **Pro** ($8/mo or $72/yr): unlimited everything, AI features, cloud sync. Highlighted card with indigo border + "Most Popular" badge. CTA → `/register`
- Use ShadCN `Button` for CTAs

### 7. CTA Section (Server Component)

**File:** `src/components/home/cta-section.tsx`

- Gradient spotlight background (radial indigo)
- Heading: "Ready to Organize Your Knowledge?" with gradient text
- Description paragraph
- Two buttons: "Get Started Free" (white bg) → `/register`, "Book a Demo" (outline) → `#` (placeholder)
- Keyboard shortcut note: "⌘ + K to search · Works on web, macOS, Windows, Linux"

### 8. Footer (Server Component)

**File:** `src/components/home/footer.tsx`

- DevVault logo + tagline
- Social links: GitHub, Twitter/X, Discord (placeholder `#` hrefs)
- Four link columns: Product, Resources, Company (placeholder `#` hrefs for now, except Features/#features, Pricing/#pricing, AI/#ai)
- Copyright line with dynamic year
- "Built by developers, for developers." tagline

## Background Decorations (in page.tsx)

- Fixed grid pattern background (`grid-bg` class via Tailwind or CSS)
- Two blurred glow blobs (blue/indigo) positioned absolutely behind content — use Tailwind `blur-3xl` + opacity

## Routes / Links

| Element | Destination |
|---|---|
| Logo | `/` |
| Sign In | `/login` |
| Get Started (all instances) | `/register` |
| Features nav link | `#features` (smooth scroll) |
| Pricing nav link | `#pricing` (smooth scroll) |
| AI nav link | `#ai` (smooth scroll) |
| See How It Works | `#features` (smooth scroll) |
| See Pro pricing | `#pricing` (smooth scroll) |
| Book a Demo | `#` (placeholder) |
| Footer social links | `#` (placeholder) |
| Footer nav links | `#` or anchor sections |

## File Structure

```
src/app/page.tsx                          # Main page — imports all sections
src/components/home/navbar.tsx            # Client: scroll-aware navbar
src/components/home/hero.tsx              # Server: hero section
src/components/home/chaos-order.tsx       # Server: chaos → order visual
src/components/home/features.tsx          # Server: feature cards grid
src/components/home/ai-section.tsx        # Server: AI section
src/components/home/pricing.tsx           # Client: pricing with toggle
src/components/home/cta-section.tsx       # Server: CTA section
src/components/home/footer.tsx            # Server: footer
```

## Styling Notes

- Use `bg-background text-foreground` from theme for base
- Gradient text: `bg-gradient-to-r from-white via-blue-300 to-purple-400 bg-clip-text text-transparent`
- Card backgrounds: `bg-white/[0.02]` or `bg-white/5` with `border-white/10`
- Section padding: `py-24 lg:py-32`
- Max width container: `max-w-7xl mx-auto px-6 lg:px-8`
- Use existing `material-symbols-outlined` class for icons where applicable, otherwise Lucide React
- All animations must respect `prefers-reduced-motion`

## Implementation Notes

- `page.tsx` is a server component that composes all section components
- Only `navbar.tsx` and `pricing.tsx` need `'use client'` (scroll listener and toggle state)
- No new packages needed — everything uses existing Tailwind + ShadCN setup
- Keep components focused and DRY — extract shared patterns (e.g., gradient text, section headings) into small helper components or utility classes if reused 3+ times
