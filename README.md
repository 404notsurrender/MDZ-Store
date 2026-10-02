# MDZ Store — Standalone Vercel + Supabase

This repository is a standalone version of the uploaded store codebase.

## What was changed

- Removed Lovable-specific application dependencies and integrations.
- Removed the Lovable project metadata from the repository.
- Replaced Lovable OAuth helper with native Supabase OAuth.
- Replaced Lovable preview auth storage with normal browser Supabase session storage.
- Replaced the Lovable Vite config with standard TanStack Start + Nitro + Vite.
- Added Vercel deployment configuration.
- Removed the old Lovable-connected `.env`.
- Added `.env.example`.
- Added a standalone Supabase migration under `supabase/migrations/`.
- Kept the existing TanStack Start / React / Supabase architecture.

## Requirements

- Node.js 20+ (Node.js 22 is recommended)
- A new Supabase project
- A Vercel account
- A Pakasir account if QRIS payments are enabled

## 1. Create the new Supabase project

Create a new project in Supabase, then copy:

- Project URL
- Publishable key
- Secret/service-role key

Do **not** put the secret/service-role key in any `VITE_*` variable.

Run the SQL migration in:

`supabase/migrations/20261002000000_initial_schema.sql`

You can run it from Supabase SQL Editor, or use the Supabase CLI after linking the project.

### Create the first admin

1. Create your account through the website.
2. In Supabase Dashboard → Authentication → Users, copy the user's UUID.
3. Run:

```sql
insert into public.user_roles (user_id, role)
values ('YOUR_USER_UUID', 'admin')
on conflict (user_id, role) do nothing;
```

The existing admin route checks `has_role(auth.uid(), 'admin')`.

## 2. Environment variables

Copy `.env.example` to `.env.local` for local development.

Required:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

For Pakasir:

```env
PAKASIR_SLUG=pasar-setan
PAKASIR_API_KEY=YOUR_PAKASIR_API_KEY
```

The Pakasir API key is server-only. Never prefix it with `VITE_`.

## 3. Supabase Auth

For email/password authentication, enable Email provider.

For Google login, enable Google under:

Supabase Dashboard → Authentication → Providers

Add the Vercel production URL and local URL to the Supabase Auth redirect/site URL configuration.

Example production callback origin:

`https://your-domain.com`

The application sends Google OAuth users back to:

`/auth?redirect=...`

## 4. Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run start
```

## 5. Deploy to Vercel

Push this repository to GitHub, then import the repository into Vercel.

The repository includes:

`vercel.json`

with TanStack Start framework detection.

Add these variables in Vercel → Project → Settings → Environment Variables:

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
PAKASIR_SLUG
PAKASIR_API_KEY
APP_URL
```

Use separate values for Production / Preview if desired.

TanStack Start is supported on Vercel through Nitro. The production build is the normal `vite build` output.

## 6. Pakasir webhook

The existing webhook route is:

`POST /api/public/webhooks/pakasir`

After deployment, configure Pakasir to send webhooks to:

`https://YOUR_DOMAIN/api/public/webhooks/pakasir`

The server does not trust the webhook alone. It re-verifies the transaction against Pakasir before marking an order as paid.

## 7. Important security rules

- Never commit `.env.local` or production secrets.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Never expose `PAKASIR_API_KEY` to the browser.
- Only publish the Supabase publishable key through `VITE_*`.
- Server-side order creation recalculates prices from Supabase.
- Payment completion is verified server-side.
- Admin access is controlled by `public.user_roles`.

## 8. Repository structure

```text
src/
  routes/                  # TanStack Start pages and API routes
  components/              # UI/store components
  integrations/supabase/   # Native Supabase client/auth
  lib/                     # Commerce + payment server functions
  assets/                  # Store assets

supabase/
  migrations/              # Database schema for the new project

vercel.json                # Vercel/TanStack Start configuration
.env.example               # Environment variable template
```

## Note about the Lovable preview badge

A platform/editor badge shown inside a Lovable editor or preview is not part of the application source itself. When this repository is deployed independently to Vercel, the Lovable editor UI is not involved.

This version also removes the Lovable-specific runtime integrations from the application source.

## Security update — October 2026

TanStack Start 1.168.32 was affected by CVE-2026-102989 (reflected XSS in server-function responses). This standalone build pins `@tanstack/react-start` to 1.168.60 and the corresponding patched TanStack Start server-core to 1.169.39. Do not deploy the old lockfile or set `DANGEROUSLY_DEPLOY_VULNERABLE_TANSTACK_START_XSS=1` as a workaround. Reinstall dependencies from the updated `package.json` before deployment.
