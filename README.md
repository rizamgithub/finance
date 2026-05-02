# Gold & Finance Tracker

Local-first personal finance + physical gold portfolio dashboard.
Currency: **MYR** (`RM 1,234.56`).

## Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + hand-rolled shadcn/ui-style primitives
- SQLite + Prisma ORM
- recharts, lucide-react, sonner, zod

## Getting started

```powershell
npm install
npx prisma migrate dev --name init   # only the first time
npm run dev
```

Open http://localhost:3000.

## Features
- Add Income/Expense transactions (categorised), delete from list.
- Monthly summary: Income / Expense / Net.
- Gold portfolio: enter grams owned and price-per-gram (MYR). Total value computed live.
- Net worth = cash balance (income − expense across all time) + gold value.
- Spending-by-category pie (current month) and 6-month income-vs-expense bar.

## Gold price API (optional)

The Refresh button on the Gold card calls `POST /api/gold/refresh`, which uses [goldapi.io](https://www.goldapi.io/).

1. Sign up at goldapi.io and get a free API key.
2. Edit `.env`:
   ```
   GOLD_API_KEY="your-key-here"
   ```
3. Restart `npm run dev`.

Without a key the app still works fully — the `Price per gram` field is manually editable. Refresh shows a "no key" toast and changes nothing.

## Data location
SQLite file at `prisma/dev.db`. Reset with:
```powershell
npx prisma migrate reset
```

## Project layout
```
app/
  page.tsx                 # dashboard (server component)
  layout.tsx
  globals.css
  actions/
    transactions.ts        # Server Actions: create/delete/list/summaries
    gold.ts                # Server Actions: get/set gold holding
  api/gold/refresh/route.ts# goldapi.io fetch (POST)
components/
  transaction-form.tsx
  transaction-list.tsx
  summary-card.tsx
  net-worth-card.tsx
  gold-card.tsx
  charts/category-pie.tsx
  charts/monthly-bar.tsx
  ui/                      # button, card, input, label, select, table, sonner
lib/
  prisma.ts
  format.ts                # formatMYR, formatGrams
  categories.ts
  utils.ts
prisma/
  schema.prisma
```
