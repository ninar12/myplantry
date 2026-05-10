# Plantry — Architecture Overview

> **Cook what you have.** Plantry is an AI-powered pantry and meal planning app that flips the standard meal-planning model: instead of starting with a recipe, it looks at what you already own, tracks expiration dates, and uses AI to generate recipes that prioritize ingredients expiring soon.

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server components, API routes, and Vercel deployment in one unified framework |
| Styling | Tailwind CSS v4 | Utility-first, mobile-first responsive design |
| Database | Supabase (PostgreSQL) | Managed Postgres with pgvector, RLS, and real-time support |
| AI | Google Gemini 3.1 Pro Preview | Multimodal — handles recipe generation, shelf life estimation, and future photo scanning |
| Auth | NextAuth.js + Google OAuth | Familiar login flow; user records auto-provisioned on first sign-in |
| Payments | Stripe | Subscription billing for Pro and Team tiers |
| Deployment | Vercel | Edge functions, cron jobs, and CI/CD out of the box |

---

## Authentication & User Provisioning

Authentication uses **NextAuth.js with Google OAuth**. On first sign-in, a `getOrCreateUser()` helper upserts the user record into Supabase, and a **PostgreSQL trigger** (`on_user_created`) automatically provisions a `free` subscription row — no manual step required. This means every user always has a subscription record, which simplifies downstream plan checks.

---

## Database Design

The schema is built around five core tables: `users`, `pantry_items`, `grocery_items`, `saved_recipes`, and `subscriptions`.

**Row Level Security (RLS)** is enabled on all tables. The app uses the Supabase service role key (which bypasses RLS), while direct or anonymous access is fully locked down. Policies use `current_setting('app.user_id')` for per-row user isolation.

**pgvector** is enabled as a Postgres extension, providing the foundation for semantic recipe search without requiring a separate vector database service.

---

## Subscription Tiers

| Feature | Free | Pro ($9.99/mo) | Team ($24.99/mo) |
|---|---|---|---|
| Pantry items | 30 | Unlimited | Unlimited |
| Saved recipes | 5 | Unlimited | Unlimited |
| AI recipe generation | Rate-limited | Full | Full |
| Photo scanning | — | ✓ | ✓ |
| Household sharing | — | — | Up to 5 members |

Tier limits are enforced in API route middleware before any database write. Stripe webhooks keep the `subscriptions` table in sync with billing state.

---

## Expiration Date System

This is the core intelligence of Plantry. Rather than asking users to manually enter expiration dates, the system estimates them automatically using a **three-tier lookup**:

```
User marks item as bought
        ↓
1. Query shelf_life table (USDA FoodKeeper seed data)
   — fuzzy match via pg_trgm similarity index
        ↓
   Match found?
   YES → return shelf life in ms, done (sub-millisecond)
        ↓
   NO →
2. Call Gemini API with food safety expert prompt
   — returns pantry_days / fridge_days / freezer_days / opened_fridge_days
   — 10s timeout with 7-day safe fallback
        ↓
3. Cache Gemini response back into shelf_life table (source: 'gemini')
   — next lookup for the same ingredient hits the DB, not the AI
```

The `shelf_life` table is seeded from the **USDA FoodKeeper dataset** — a government-published, programmatically accessible source covering hundreds of common ingredients. Using `pg_trgm` trigram similarity, "roma tomatoes" correctly matches "tomatoes" without requiring exact string matching.

The self-healing cache means the system gets faster and cheaper with every user interaction — a flywheel that reduces AI API costs over time.

Storage location (fridge / pantry / freezer) is captured at add-time and used to select the correct shelf life field, since the same ingredient can have wildly different expiration windows depending on where it's stored.

---

## Recipe Generation

Recipe generation uses a **retrieval-first with generative fallback** pattern:

```
User requests a recipe
        ↓
1. Embed current pantry items (Gemini text-embedding-004, 768d)
2. Query pgvector for semantically similar recipes in corpus
   (Open Recipe Data + curated seeds)
        ↓
   Good match? (similarity > threshold)
   YES → return retrieved recipe
        ↓
   NO →
3. Generate recipe with Gemini
   — prompt prioritizes expiring-soon ingredients
   — returns structured JSON: title, ingredients, instructions, pantry_matches
   — calculates match_percentage against user's actual pantry
```

Retrieved recipes are predictable and cheap. Generated recipes handle novel combinations. The corpus grows over time as high-quality generated recipes are optionally saved back.

---

## AI Integration

All AI calls go through the **Google GenAI SDK** (`@google/genai`) using Gemini 3.1 Pro Preview. Prompts are structured to return raw JSON (no markdown fences), with a cleaning step before `JSON.parse()`. Every AI route has a timeout and a graceful fallback so failures are invisible to users.

Future: **Gemini multimodal** will power the photo/receipt scanning feature (Pro tier) — sending an image directly to Gemini to extract ingredient names and quantities, without a separate OCR service.

---

## Pantry Intelligence

Beyond storage, the pantry list has a full **urgency system**:

| Level | Condition | Visual treatment |
|---|---|---|
| Critical | 0–2 days | Red card, bold badge |
| Warning | 3–7 days | Amber card |
| Fresh | 8+ days | White card |
| Expired | Past date | Gray, struck through |

Items are sorted by urgency first, then by days remaining. Users can also log partial usage (25% / 50% / 75% / 100%) which updates the quantity in real time and removes the item when fully consumed.

---

## Notifications

A **Vercel Cron Job** runs daily at 8am UTC. It queries all pantry items expiring within 3 days across all users, groups them by user, and sends a single digest email via **Resend**. All tiers receive notifications — it's a core feature, not a paywall.

---

## Design System

The UI is built on a custom design system (`plantry-ui`) with:
- **Color tokens**: warm cream background, deep forest green primary, gold CTAs, terracotta accent
- **Responsive layout**: sidebar navigation on desktop → bottom navigation on mobile
- **Component patterns**: `rounded-2xl` cards, pill badges, urgency-aware list items
- **Mobile-first**: all breakpoints written base → sm → md → lg → xl

UI designs are generated and iterated in **Google Stitch** (AI design tool), then imported into the codebase via the Stitch MCP integration with Claude Code.

---

## Key Architectural Decisions

**Single database for structured + vector data.** Using pgvector on Supabase avoids running a separate vector database service. At current scale this is the right tradeoff — simpler ops, one connection string, one bill. The decision to add a dedicated vector DB (Pinecone, Qdrant) is deferred until there's evidence of scale pressure.

**AI fallback, not AI dependency.** No user-facing flow requires AI to succeed. Shelf life falls back to 7 days. Recipe generation falls back to a cached result. This keeps the app functional during API outages and controls costs.

**Self-seeding knowledge base.** Every AI response that isn't already in the database gets cached back. The system starts with USDA data and gets smarter over time without any manual curation step.

**RLS + service role pattern.** All application queries use the service role (bypasses RLS), while RLS policies exist to protect against direct database access. This is the standard Supabase production pattern — security without query complexity.
