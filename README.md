# The Copper Cup — QR Menu

A mobile-first digital menu and admin panel for a café, built with Next.js
(App Router), Tailwind CSS, and Upstash Redis for persistent storage.

- **`/`** — the customer-facing menu: category grid → category drilldown,
  search, and a TR/EN language switcher (Turkish by default).
- **`/admin`** — a PIN-protected panel for staff to edit prices inline,
  toggle items active/sold-out, feature items, and add or delete products.

## Getting started

1. **Set up Redis.** The menu is stored in [Upstash Redis](https://upstash.com)
   so it persists across deploys (Vercel's filesystem is read-only/ephemeral
   at runtime, so a local JSON file won't survive a redeploy). Either:
   - Create a free database at [upstash.com](https://upstash.com) and copy
     its **REST URL** and **REST Token** from the database dashboard, or
   - On Vercel, add the **Upstash** integration from the
     [Vercel Marketplace](https://vercel.com/marketplace) to this project —
     it provisions the database and injects the env vars for you, and you
     can pull them locally with `vercel env pull .env.local`.

2. **Configure environment variables.** Copy `.env.example` to `.env.local`
   and fill in the two Upstash values (see `.env.example` for details). You
   can also set `NEXT_PUBLIC_ADMIN_PIN` there to change the admin PIN from
   the default `1234`.

3. **Install dependencies and run the dev server:**

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) for the menu, and
   [http://localhost:3000/admin](http://localhost:3000/admin) for the admin
   panel.

The first request after setup automatically seeds Redis from the starter
menu in `data/menu.json` — after that, Redis is the live source of truth and
that file is no longer read at runtime.

## Project structure

- `src/lib/menu.ts` — the `MenuData` types plus `readMenuData`/`writeMenuData`,
  backed by Redis.
- `src/app/api/menu/route.ts` — the menu API (`GET` is public; `POST`/
  `PATCH`/`DELETE` require an `x-admin-pin` header matching the admin PIN).
- `src/components/menu/*` — the customer-facing UI.
- `src/components/admin/*` — the admin panel UI.
- `src/lib/i18n.ts` — bilingual (EN/TR) UI copy and the `LocalizedText` helper.

## Deploy on Vercel

Push this repo to GitHub and import it on [Vercel](https://vercel.com/new).
Add the Upstash integration (or set the env vars manually) before your first
deploy so the menu has somewhere to persist.
