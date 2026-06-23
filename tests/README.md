# Tests

Integration tests that run against the **live** Supabase project using the
credentials in `../.env` (loaded automatically via `--env-file`). Each test
creates its own throwaway users (`test_*@example.test`) and deletes them in
teardown — deleting the auth user cascades through profiles → brands/creators →
campaigns → links → conversions, so nothing is left behind.

## Run
```bash
npm test               # all suites
npm run test:triggers  # DB triggers & constraints only
npm run test:functions # edge functions only
npm run test:rls       # RLS policies only
```

## What's covered (25 tests)

**`01-db-triggers.test.mjs`** — `handle_new_user` profile creation; affiliate
link auto-generation on match approval (+ idempotency); commission/platform-fee
computation and `spent` bump; `approved_at`/`confirmed_at` stamping; duplicate
`order_reference` rejection; multiple NULL order refs allowed.

**`02-edge-functions.test.mjs`** — `track-click` redirects + async click
logging; `record-conversion` happy path, duplicate-order (409), unknown ref
(404), validation (400), and the 10/hour rate limit (429);
`generate-payout-report` aggregation + auth guard; `create-payout` linking +
marking paid + double-pay protection (409).

**`03-rls.test.mjs`** — creators see only their own conversions/profile/creator
row, only browse active campaigns, can't read other creators' data; anon is
locked out; brands see only their own conversions.

## Notes
- Tests hit real edge functions, so they need the functions deployed and the
  project reachable. Total runtime ~15–20s.
- They do **not** require the Google Sheets credential; `sync-converty-sheet`
  is not exercised here (it needs a real sheet + service account).
