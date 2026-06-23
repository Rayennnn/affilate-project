# UGC Affiliate Marketplace — Supabase Backend

Complete backend for a SaaS that connects **Converty.shop brands** with **UGC
creators**. Creators get a unique affiliate link per campaign; when a customer
buys through it, the creator earns a commission and the platform takes a cut of
that commission. Everything runs on Supabase — Auth, Postgres + Row Level
Security, and Edge Functions. The Next.js frontend is a separate codebase owned
by another developer; **this repo is backend only**.

- **Live project ref:** `rrzpvsgbusukotugwtmp`
- **Status:** schema, RLS, triggers, views and 5 edge functions deployed to the
  cloud and covered by 25 passing integration tests. Google Sheets order sync is
  deployed but dormant until credentials are supplied (see [Deferred work](#deferred-work)).

---

## Table of contents
1. [Stack](#stack)
2. [Repository layout](#repository-layout)
3. [Data model](#data-model)
4. [Authentication & roles](#authentication--roles)
5. [Row Level Security](#row-level-security-rls)
6. [Automatic behaviour (triggers)](#automatic-behaviour-triggers)
7. [Money rules](#money-rules)
8. [Edge Functions — API reference](#edge-functions--api-reference)
9. [Views](#views)
10. [Environment variables](#environment-variables)
11. [Deploy from scratch](#deploy-from-scratch)
12. [Testing](#testing)
13. [Seed data](#seed-data)
14. [Deferred work](#deferred-work)
15. [Design decisions & deviations from spec](#design-decisions--deviations-from-spec)

---

## Stack
- **Postgres 15** with Row Level Security enabled on every table.
- **Supabase Auth** — email/password **and Google OAuth** (sign in with Google).
  The role lives in `profiles.role`.
- **Edge Functions** — Deno / TypeScript, deployed to `*.functions.supabase.co`.
- **Google Sheets API** — service-account read of the Converty order sheet (sync).
- **Local tooling without Docker:** the Supabase CLI is a dev dependency, invoked
  as `npx supabase`. Because Docker is not installed, we **push straight to the
  cloud** rather than running a local stack.

---

## Repository layout
```
.
├── .env                         # real secrets (gitignored)
├── .env.example                 # placeholder template
├── package.json                 # CLI + test scripts + supabase-js
├── README.md                    # this file
├── supabase/
│   ├── config.toml              # project + per-function config (JWT, cron note)
│   ├── migrations/
│   │   ├── 001_create_enums.sql
│   │   ├── 002_create_tables.sql
│   │   ├── 003_create_rls_policies.sql
│   │   ├── 004_create_functions_triggers.sql
│   │   ├── 005_create_views.sql
│   │   └── 006_create_indexes.sql
│   ├── functions/
│   │   ├── _shared/             # cors.ts + supabase.ts (clients, requireAdmin)
│   │   ├── track-click/
│   │   ├── record-conversion/
│   │   ├── sync-converty-sheet/
│   │   ├── generate-payout-report/
│   │   └── create-payout/
│   └── seed.sql                 # demo data (local db reset / manual SQL editor)
└── tests/
    ├── helpers.mjs
    ├── 01-db-triggers.test.mjs
    ├── 02-edge-functions.test.mjs
    └── 03-rls.test.mjs
```

---

## Data model

Relationship chain:
```
auth.users ─1:1─ profiles ─┬─1:1─ brands ──1:N─ campaigns ──1:N─ matches
                           │                         │              │
                           └─1:1─ creators ──────────┘              │ (approved)
                                     │                              ▼
                                     │                       affiliate_links ─1:1─ matches
                                     │                              │
                                     ▼                              ▼
                                  payouts                      conversions ──N:1─ campaigns/brands/creators
                                     │                              │
                              payout_conversions ◄─────────────────┘
                                                              click_events ─N:1─ affiliate_links
```

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | 1:1 extension of `auth.users`; holds the role | `id` (=auth uid), `role` (`brand`/`creator`/`admin`), `full_name`, `email` |
| `brands` | e-commerce store on Converty | `profile_id`, `store_name`, `store_url`, `gtm_id`, `konnect_deposit`, `is_verified` |
| `creators` | UGC creator | `profile_id`, `niche`, socials, `audience_size`, `iban`, `is_verified` |
| `campaigns` | a product a brand promotes | `brand_id`, `product_url`, `commission_rate`, `platform_fee_rate`, `budget`, `spent`, `status` |
| `matches` | creator ↔ campaign application | `campaign_id`, `creator_id`, `status`, `approved_at`, unique(campaign,creator) |
| `affiliate_links` | generated on approval | `match_id`, `ref_code` (unique), `full_url`, `clicks` |
| `conversions` | a tracked sale | `affiliate_link_id`, `sale_amount`, `commission_amount`, `platform_fee`, `source`, `status` |
| `payouts` | money sent to a creator for a period | `creator_id`, `amount`, `status`, `period_start/end`, `reference` |
| `payout_conversions` | join: which conversions a payout covers | `payout_id`, `conversion_id` |
| `click_events` | raw click tracking | `affiliate_link_id`, `ip_address`, `user_agent`, `device`, `country` |

**Enums:** `user_role`, `campaign_status` (`draft/active/paused/completed`),
`match_status` (`pending/approved/rejected/completed`), `conversion_source`
(`gtm/sheet/manual`), `conversion_status` (`pending/confirmed/cancelled/paid`),
`payout_status` (`pending/processing/completed/failed`).

A **partial unique index** on `conversions.order_reference` (where not null)
enforces "one conversion per Converty order" at the database level.

---

## Authentication & roles

Three roles in `profiles.role`: `brand`, `creator`, `admin`.

**Sign-up paths:**
- **Email/password** — the frontend passes `role` and `full_name` in the signup
  metadata, which the `handle_new_user` trigger copies into `profiles`.
- **Google OAuth (enabled)** — Google supplies `full_name`, `email`, `avatar_url`
  in the identity metadata but **not a role**. The trigger therefore defaults
  Google sign-ups to **`creator`** (`coalesce(... ->> 'role', 'creator')`).

> ⚠️ **Frontend implication for Google login:** since OAuth users land as
> `creator` with no chance to choose, the app should either (a) present a
> role-selection step after first Google login and `update profiles set role=…`,
> or (b) pass `role` via the OAuth `options.data` / a custom claim when you want
> brands to sign up with Google. Admins are always assigned manually.

Admin detection in policies/functions never trusts the client — it is resolved
server-side via the `SECURITY DEFINER` helper `public.is_admin()`.

---

## Row Level Security (RLS)

Enabled on **every** table. Summary of who can do what:

| Table | brand | creator | admin | public/anon |
|---|---|---|---|---|
| `profiles` | own row | own row | all | – |
| `brands` | own row (CRUD) | read all (browse) | all | – |
| `creators` | read all (browse) | own row (CRUD) | all | – |
| `campaigns` | own (CRUD) | read **active** only | all | – |
| `matches` | read/update on own campaigns | own (CRUD) | all | – |
| `affiliate_links` | read on own campaigns | read own | all | – |
| `conversions` | read own (`brand_id`) | read own (`creator_id`) | all | – |
| `payouts` | – | read own | all | – |
| `payout_conversions` | – | read own (via payout) | all | – |
| `click_events` | – | – | read | **insert only** (tracking) |

Role checks route through `public.is_admin()` / `public.is_creator()`
(`SECURITY DEFINER`) to avoid the infinite recursion you get from sub-selecting
`profiles` inside a `profiles` policy. The dashboard **views** use
`security_invoker = on` so they respect the querying user's RLS.

---

## Automatic behaviour (triggers)

| Trigger / function | Fires | Effect |
|---|---|---|
| `handle_new_user` | after insert on `auth.users` | creates the `profiles` row from signup metadata (role defaults to `creator`) |
| `set_match_approved_at` | before insert/update on `matches` | stamps `approved_at` when status → `approved` |
| `create_affiliate_link_on_approval` | after insert/update on `matches` | generates a unique 8-char `ref_code` + `full_url`; idempotent per match |
| `generate_ref_code` | (helper) | random 8 hex chars, retried until unique |
| `calculate_conversion_amounts` | before insert on `conversions` | computes `commission_amount` + `platform_fee`, increments `campaigns.spent` |
| `set_conversion_confirmed_at` | before update on `conversions` | stamps `confirmed_at` when status → `confirmed` |
| `increment_link_clicks(uuid)` | (RPC, called by track-click) | atomic `clicks = clicks + 1` |
| `update_updated_at` | before update on most tables | maintains `updated_at` |

---

## Money rules

For a sale of `sale_amount` on a campaign with `commission_rate`%
and `platform_fee_rate`%:

```
commission_amount = round(sale_amount × commission_rate%   , 2)   # creator's gross
platform_fee      = round(commission_amount × platform_fee_rate% , 2)   # platform's cut OF the commission
campaigns.spent  += commission_amount + platform_fee
```

Example — sale 100 DT, commission 20%, platform fee 25%:
`commission = 20`, `platform_fee = 5`, `spent += 25`.

> The platform fee is taken **on top of** the commission (both added to `spent`).
> If you want the platform to take its cut **out of** the creator's commission
> instead (creator nets `commission − fee`), change the two lines in
> `calculate_conversion_amounts` in `004_create_functions_triggers.sql`.

---

## Edge Functions — API reference

Base URL: `https://rrzpvsgbusukotugwtmp.functions.supabase.co`
All JSON responses use the envelope `{ success: boolean, data?, error? }`.
Public functions send CORS headers and handle `OPTIONS` preflight.

### `GET track-click?ref=CODE` — public
Logs a click (asynchronously, via `EdgeRuntime.waitUntil`) and `302`-redirects to
the affiliate `full_url`. Unknown/missing ref → `302` to `LANDING_PAGE_URL`.
```bash
curl -i "$BASE/track-click?ref=a7c3f9d1"
# HTTP/1.1 302 Found
# Location: https://shop.converty.shop/p/widget?ref=a7c3f9d1
```

### `POST record-conversion` — public (GTM / manual)
```jsonc
// body
{ "ref_code": "a7c3f9d1", "sale_amount": 120, "order_reference": "ORD-9", "source": "gtm" }
```
Validates the body, checks the campaign is `active` and within budget, then
inserts the conversion (the trigger fills the amounts). **Anti-fraud:** rejects a
duplicate `order_reference` (409) and rate-limits to **10 conversions / ref_code
/ hour** (429). Returns `201` with the created conversion.
Errors: `400` bad body · `404` unknown ref · `409` duplicate / budget exhausted ·
`429` rate-limited.

### `POST sync-converty-sheet` — admin / service_role
```jsonc
{ "spreadsheet_id": "1AbC…", "sheet_name": "Sheet1" }
```
Reads the Converty sheet via a Google service account, and for every row with
`Status = delivered` whose `Note` contains a known `ref_code`, creates a
`source = sheet`, `status = confirmed` conversion (skipping orders already
imported by `Reference`). Returns `{ processed, new_conversions, skipped, errors[] }`.
**Dormant until `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON` is set** — see Deferred work.

### `POST generate-payout-report` — admin / service_role
```jsonc
{ "period_start": "2026-06-01", "period_end": "2026-06-30" }
```
Aggregates **confirmed, not-yet-paid** conversions in the period, grouped by
creator. Returns an array of
`{ creator_id, creator_name, iban, total_sales, total_commission, platform_fee, conversion_count, conversion_ids[] }`.

### `POST create-payout` — admin / service_role
```jsonc
{ "creator_id": "…", "conversion_ids": ["…"], "amount": 20, "reference": "KONNECT-123" }
```
Validates the conversions (exist, belong to the creator, are `confirmed`, not
already paid → 409), creates the payout, links the conversions via
`payout_conversions`, and marks them `paid`. Returns `201` with the payout.
> This records a payout; it does **not** call a payment provider. Real Konnect
> disbursement is future work.

**Auth model:** `track-click` and `record-conversion` are public
(`verify_jwt=false`). The three admin functions keep `verify_jwt=true` (the
gateway verifies the JWT signature) and additionally enforce admin via
`requireAdmin`, which accepts a `service_role` token (checked from the JWT
`role` **claim**, not a raw key compare) or an authenticated user whose
`profiles.role = 'admin'`.

---

## Views
- **`brand_dashboard`** — one row per (brand, campaign): active creators,
  conversion count, total sales, commissions due.
- **`creator_dashboard`** — one row per (creator, affiliate link): clicks,
  conversions, earned, `pending_payout` (confirmed), `total_paid`.
- **`admin_overview`** — single-row platform KPIs (totals, pending payouts,
  platform revenue).

All three are `security_invoker = on`, so they return only what the caller's RLS
allows.

---

## Environment variables
See `.env.example`. The real values live in `.env` (gitignored).

| Var | Used by | Notes |
|---|---|---|
| `SUPABASE_URL` | tests, functions | project URL |
| `SUPABASE_ANON_KEY` | tests, user clients | RLS-respecting |
| `SUPABASE_SERVICE_ROLE_KEY` | tests, admin paths | **full access, secret** |
| `LANDING_PAGE_URL` | track-click | fallback redirect target |
| `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON` | sync-converty-sheet | single-line service-account JSON |

Push function secrets with `npx supabase secrets set --env-file .env`
(`SUPABASE_*` are reserved and injected automatically — the CLI skips them).

---

## Deploy from scratch
No Docker required; this targets the cloud project directly.
```bash
npm install                                   # CLI + supabase-js (dev deps)
npx supabase login                            # browser auth
npx supabase link --project-ref rrzpvsgbusukotugwtmp   # prompts for DB password
npx supabase db push                          # apply all 6 migrations
npx supabase secrets set --env-file .env      # push LANDING_PAGE_URL + Google JSON
npx supabase functions deploy                 # deploy all 5 functions
```
Re-deploying a single function: `npx supabase functions deploy <name>`.

---

## Testing
Integration tests run against the **live** project (node:test, no extra
framework). Each test creates throwaway `test_*@example.test` users and deletes
them in teardown (cascade cleans the rest). ~15–20s, 25 tests.
```bash
npm test               # all suites
npm run test:triggers  # DB triggers & constraints
npm run test:functions # edge functions (incl. rate limit, payouts)
npm run test:rls       # RLS isolation
```
Coverage: signup→profile, affiliate-link auto-gen + idempotency, commission/fee
math + `spent`, timestamp stamping, duplicate-order guard, track-click
redirect+logging, record-conversion happy/dup/404/400/429, payout report + auth
guard, create-payout + double-pay protection, and full RLS isolation
(creator/brand/anon). See `tests/README.md`.

---

## Seed data
`supabase/seed.sql` creates 1 admin, 2 brands (1 active campaign each), 3
creators, approved matches (auto-generating affiliate links), sample conversions
and clicks. It runs automatically on a local `supabase db reset`; on the cloud
project, paste it into the **Dashboard → SQL Editor** to load demo data.

Demo accounts (password `password123`): `admin@example.com`,
`brand1@example.com`, `brand2@example.com`, `creator1@example.com`,
`creator2@example.com`, `creator3@example.com`.

---

## Deferred work
1. **Google Sheets order sync** — set a real `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON`
   and share the Converty sheet with the service-account email (Viewer), then
   `npx supabase secrets set --env-file .env`. The function is already deployed.
2. **Hourly CRON** for the sync — a ready-to-paste `pg_cron` + `pg_net` snippet
   is in `supabase/config.toml`; enable it once (1) works.
3. **Real Konnect disbursement** — `create-payout` currently records the transfer
   with a manual `reference`; wiring an actual payment API is future work.
4. **Google OAuth role onboarding** — add a post-login role-selection step (see
   [Authentication & roles](#authentication--roles)).

---

## Design decisions & deviations from spec
- **RLS recursion fixed:** admin/creator checks use `SECURITY DEFINER` helpers
  (`is_admin()`, `is_creator()`) instead of sub-selecting `profiles` inside a
  `profiles` policy (which recurses infinitely).
- **Added missing policies** for `creators` and `payout_conversions` (absent in
  the original spec — without them RLS would lock those tables entirely).
- **`security_invoker` views** so dashboards can't leak across tenants.
- **DB-level duplicate-order guard** via a partial unique index, not just app code.
- **Non-blocking click tracking** (`EdgeRuntime.waitUntil`) + atomic counter RPC.
- **`requireAdmin` checks the JWT `role` claim**, not a raw service-key string
  compare (the injected key and `.env` key can differ; the gateway already
  verifies the signature). This was caught by the test suite.
- **Idempotent migrations** throughout (`if not exists`, guarded `DO` blocks for
  enums, `drop policy if exists`, `create or replace trigger`).
