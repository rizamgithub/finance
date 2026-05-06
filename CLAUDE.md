# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```powershell
npm run dev          # Next.js dev server on http://localhost:3000
npm run build        # production build
npm run start        # serve production build
npm run lint         # eslint (next lint)

npx prisma migrate dev --name <name>   # create + apply a new migration
npx prisma migrate reset               # wipe + recreate prisma/dev.db
npx prisma generate                    # regenerate client (also runs on postinstall)
npx prisma studio                      # browse the SQLite DB
```

There is no test runner configured in this repo.

## Environment

`.env` holds `DATABASE_URL` (SQLite at `prisma/dev.db`) and the optional `GOLD_API_KEY` for goldapi.io. Without the key the app runs fully — gold price refresh just toasts `no_api_key` and the price-per-gram field stays manually editable.

## Architecture

**Next.js 15 App Router + React 19 + TypeScript, fully local-first.** A single SQLite file is the system of record; every mutation goes through Server Actions and ends with `revalidatePath("/")` so the dashboard re-renders. There is no auth, no API layer for the client to call directly (other than the gold-refresh route), and no client-side data store — the home page is a server component that fans out parallel reads via `Promise.all` and passes data down.

### Data flow

- **`prisma/schema.prisma`** — three models: `Transaction` (type/category/amount/date), `Category` (user-defined per type), `GoldHolding` (singleton row with `id = "default"` storing weight + last known price).
- **`lib/prisma.ts`** — singleton PrismaClient with the standard `globalThis` cache for dev hot-reload.
- **`app/actions/*.ts`** — `"use server"` modules are the only place that touches Prisma. `transactions.ts` exposes CRUD + the aggregation queries that power the cards and charts (monthly summary, cash balance, category breakdown, 6-month trend). `gold.ts` and `categories.ts` follow the same pattern. Inputs are validated with `zod`; mutations call `revalidatePath("/")`.
- **`app/page.tsx`** — server component that calls `refreshGoldPriceIfStale(1h)` then awaits all reads in parallel and composes the dashboard. Marked `export const dynamic = "force-dynamic"` so it never gets statically cached.
- **`lib/gold-price.ts`** — shared between the page (stale check on render) and `app/api/gold/refresh/route.ts` (manual refresh button). Hits `goldapi.io/api/XAU/MYR`, stores `price_gram_24k` on the singleton `GoldHolding`. Returns a discriminated union (`{ ok: true, price }` vs `{ ok: false, reason, ... }`) — preserve that shape when extending.

### UI conventions

- Tailwind + hand-rolled shadcn-style primitives in `components/ui/` (button, card, dialog, input, label, select, table, sonner). Do not pull in the shadcn CLI; extend by adding files in the same style.
- Path alias `@/*` → repo root (see `tsconfig.json`).
- Currency formatting goes through `lib/format.ts` (`formatMYR`, `formatGrams`) — always render money/weight via these helpers, not raw `toFixed`.
- Toasts use `sonner`. Lucide for icons. Charts via `recharts` in `components/charts/`.
- The dashboard is composed of "cards" (`NetWorthCard`, `SummaryCard`, `GoldCard`, etc.) that take already-computed numbers as props — keep aggregation in server actions, not in components.

### Categories

`lib/categories.ts` holds the seed defaults (`INCOME_CATEGORIES`, `EXPENSE_CATEGORIES`). Live categories come from the `Category` table via `listCategories()` and are managed at `/categories` (`app/categories/page.tsx` + `components/category-manager.tsx`). Treat the constants as defaults / fallbacks, not the source of truth at runtime.
