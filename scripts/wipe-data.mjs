// Wipe ALL data but keep the schema (tables stay).
// Deletes every auth.users row -> cascades through profiles -> brands/creators
// -> campaigns -> matches -> affiliate_links -> conversions/payouts/clicks.
// Also truncates public leaf tables as a safety net for any orphan rows.
//
// Run with:  node --env-file=.env scripts/wipe-data.mjs
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env");

const admin = createClient(URL, SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// public tables, child -> parent order (so explicit deletes never hit FK errors)
const TABLES = [
  "click_events",
  "payout_conversions",
  "payouts",
  "conversions",
  "affiliate_links",
  "matches",
  "campaigns",
  "creators",
  "brands",
  "profiles",
];

async function countAll(label) {
  const counts = {};
  for (const t of TABLES) {
    const { count } = await admin.from(t).select("*", { count: "exact", head: true });
    counts[t] = count ?? 0;
  }
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  console.log(`\n[${label}] row counts:`);
  for (const t of TABLES) console.log(`  ${t.padEnd(20)} ${counts[t]}`);
  console.log(`  ${"auth.users (sample)".padEnd(20)} (see deletion log)`);
}

async function deleteAllUsers() {
  let total = 0;
  // listUsers is paginated; keep pulling page 1 as we delete.
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
    if (error) throw error;
    const users = data.users;
    if (!users.length) break;
    for (const u of users) {
      const { error: delErr } = await admin.auth.admin.deleteUser(u.id);
      if (delErr) console.warn(`  ! failed to delete ${u.email}: ${delErr.message}`);
      else total++;
    }
    console.log(`  deleted ${total} users so far...`);
  }
  console.log(`  done: ${total} auth users deleted (cascaded to public tables)`);
}

async function deleteLeftoverRows() {
  for (const t of TABLES) {
    // delete everything; impossible-id filter satisfies the "need a filter" rule
    const { error } = await admin.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error && !/has no column named id/i.test(error.message)) {
      // payout_conversions has no id column -> delete by a different filter
      if (t === "payout_conversions") {
        await admin.from(t).delete().neq("payout_id", "00000000-0000-0000-0000-000000000000");
      } else {
        console.warn(`  ! cleanup on ${t}: ${error.message}`);
      }
    }
  }
}

console.log("=== WIPING ALL DATA (schema kept) ===");
await countAll("BEFORE");
// Public tables first (child -> parent) because conversions references
// brands/creators/campaigns WITHOUT on-delete-cascade, so a user cascade
// would hit an FK error. Clearing rows here removes that blocker.
console.log("\nClearing public tables (child -> parent)...");
await deleteLeftoverRows();
console.log("\nDeleting auth users...");
await deleteAllUsers();
await countAll("AFTER");
console.log("\nDone. Tables are empty, schema intact.");
