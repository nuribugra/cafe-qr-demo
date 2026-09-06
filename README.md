# The Copper Cup — QR Menu

A mobile-first digital menu and admin panel for a café. Customers scan a QR
code and land on a category-based menu (search included, TR/EN switch);
staff manage prices and items from a password-protected `/admin` panel.

Built with Next.js (App Router) and Tailwind, with the menu stored in
Upstash Redis so it survives redeploys — Vercel's filesystem is read-only at
runtime, so a plain JSON file wouldn't stick around.

## Setup

You'll need a Redis database and an admin password before this runs.

**1. Redis.** Grab a free one at [upstash.com](https://upstash.com) and copy
the REST URL + token from the dashboard. (If you're on Vercel, adding the
"Upstash for Redis" integration from their Marketplace does this for you
automatically — it might name the vars `KV_REST_API_URL`/`KV_REST_API_TOKEN`
instead, which the app also understands.)

**2. Admin password.** There's no default — run these two commands and
they'll print the values you need:

```bash
node scripts/hash-password.mjs "your-chosen-password"
node scripts/generate-session-secret.mjs
```

Neither one sends anything anywhere, they just print a value for you to
paste into your env file.

**3. Put it all together.** Copy `.env.example` to `.env.local`, fill in the
four values from steps 1–2, then:

```bash
npm install
npm run dev
```

Menu's at `localhost:3000`, admin at `localhost:3000/admin`.

The first request seeds Redis from `data/menu.json` automatically. After
that Redis is the source of truth and the file's only there as a fallback
seed — editing it directly won't do anything once the site's been visited
once.

## How the admin panel is protected

Password is bcrypt-hashed, checked server-side only, never sent to the
browser. A successful login gets you a signed, HttpOnly session cookie (12h)
— `src/proxy.ts` checks it before any admin page or menu-editing request
even runs, and the API route checks it again itself as a backup. Login
attempts and menu edits are both rate-limited per IP through the same Redis
database, and request bodies go through Zod validation before touching
anything.

Good enough for one café's own admin panel. It's not built to host multiple
cafés on one deployment — that'd need separate data per tenant, which is a
different project.

## Deploying

Push to GitHub, import on Vercel, and add all four env vars in the project
settings before the first deploy. The menu itself will render fine without
them, but the admin panel won't let anyone in until they're set.
