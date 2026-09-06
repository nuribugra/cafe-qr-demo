# The Copper Cup — QR Menu

A mobile-first digital menu and admin panel for a café, built with Next.js
(App Router), Tailwind CSS, and Upstash Redis for persistent storage.

- **`/`** — the customer-facing menu: category grid → category drilldown,
  search, and a TR/EN language switcher (Turkish by default).
- **`/admin`** — a password-protected panel for staff to edit prices inline,
  toggle items active/sold-out, feature items, and add or delete products.

## Getting started

1. **Set up Redis.** The menu is stored in [Upstash Redis](https://upstash.com)
   so it persists across deploys (Vercel's filesystem is read-only/ephemeral
   at runtime, so a local JSON file won't survive a redeploy). Either:
   - Create a free database at [upstash.com](https://upstash.com) and copy
     its **REST URL** and **REST Token** from the database dashboard, or
   - On Vercel, add the **Upstash for Redis** integration from the
     [Vercel Marketplace](https://vercel.com/marketplace) to this project —
     it provisions the database and injects the env vars for you (it may
     name them `KV_REST_API_URL`/`KV_REST_API_TOKEN` instead; the app
     accepts either naming). Pull them locally with `vercel env pull .env.local`.

2. **Set up admin authentication.** There's no default password — the app
   refuses to start the admin flow until you set one:

   ```bash
   node scripts/hash-password.mjs "your-chosen-password"
   node scripts/generate-session-secret.mjs
   ```

   The first prints a bcrypt hash for `ADMIN_PASSWORD_HASH`; the second a
   random secret for `ADMIN_SESSION_SECRET`, used to sign admin session
   cookies. Neither command sends anything anywhere — they just print a
   value to paste into your env vars.

3. **Configure environment variables.** Copy `.env.example` to `.env.local`
   and fill in the four values from steps 1–2 (see `.env.example` for
   details on each).

4. **Install dependencies and run the dev server:**

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) for the menu, and
   [http://localhost:3000/admin](http://localhost:3000/admin) for the admin
   panel (redirects to `/admin/login` until you sign in).

The first request after setup automatically seeds Redis from the starter
menu in `data/menu.json` — after that, Redis is the live source of truth and
that file is no longer read at runtime.

## Security model

- **Admin auth**: a single admin password, hashed with bcrypt and never
  shipped to the client. A successful login issues a signed, HttpOnly,
  Secure (in production), `SameSite=Strict` session cookie valid for 12
  hours — not a value read from `localStorage`/`sessionStorage`.
- **Route protection**: `src/proxy.ts` (Next.js 16's replacement for
  `middleware.ts`) blocks unauthenticated requests to `/admin/*` pages and
  to any non-GET `/api/menu` request before they're handled. `src/app/api/menu/route.ts`
  re-checks the session itself too, since Next.js's own docs warn a future
  refactor could silently narrow Proxy's coverage — don't remove that
  second check when editing the route.
- **Rate limiting**: `@upstash/ratelimit`, backed by the same Redis
  database, throttles login attempts (5 per 5 minutes per IP) and mutating
  menu requests (30 per minute per IP).
- **Input validation**: all API request bodies are validated with
  [Zod](https://zod.dev) (`src/lib/validation.ts`) before touching the data
  layer.
- **Headers**: `next.config.ts` sets `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, HSTS, and a Content-Security-Policy
  on every response.

This covers a single real café's admin panel. It is **not** a multi-tenant
design — there's one shared admin password and one Redis key for the whole
menu. Turning this into a product served to multiple café clients would need
per-tenant data isolation and accounts, which is a separate, larger project.

## Project structure

- `src/lib/menu.ts` — the `MenuData` types plus `readMenuData`/`writeMenuData`,
  backed by Redis.
- `src/lib/auth.ts` — password verification and session token signing/verification.
- `src/lib/rate-limit.ts` — Upstash-backed rate limiters for login and mutations.
- `src/lib/validation.ts` — Zod schemas for API request bodies.
- `src/proxy.ts` — blocks unauthenticated access to `/admin/*` and mutating `/api/menu` calls.
- `src/app/api/menu/route.ts` — the menu API (`GET` is public; `POST`/`PATCH`/`DELETE` require a valid session).
- `src/app/api/admin/login|logout/route.ts` — session login/logout endpoints.
- `src/components/menu/*` — the customer-facing UI.
- `src/components/admin/*` — the admin panel UI.
- `src/lib/i18n.ts` — bilingual (EN/TR) UI copy and the `LocalizedText` helper.

## Deploy on Vercel

Push this repo to GitHub and import it on [Vercel](https://vercel.com/new).
Before your first deploy, add all four env vars (Upstash + the two admin auth
values) in the project's Environment Variables settings — the site's public
menu will work without them, but the admin panel will refuse all access
until they're set (fails closed, not open).
