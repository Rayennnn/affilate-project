// Diagnose signup 429. Compares:
//  (A) anon signUp  -> goes through the public /auth/v1/signup endpoint (rate limited, sends email if confirmations on)
//  (B) admin.createUser -> bypasses email + endpoint limits (proves DB/trigger are fine)
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const anon = createClient(URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });
const admin = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

const email = `diag_${Math.random().toString(36).slice(2, 8)}@example.com`;

console.log("URL:", URL);
console.log("Test email:", email, "\n");

// (A) public signup endpoint
console.log("--- (A) anon.auth.signUp (public endpoint) ---");
const a = await anon.auth.signUp({
  email,
  password: "Password123!",
  options: { data: { role: "brand", full_name: "Diag Brand" } },
});
if (a.error) {
  console.log("  status:", a.error.status);
  console.log("  code:  ", a.error.code);
  console.log("  msg:   ", a.error.message);
} else {
  console.log("  OK -> user id:", a.data.user?.id, "| session:", !!a.data.session,
    "| email_confirmed_at:", a.data.user?.email_confirmed_at ?? "(null = confirmation required)");
}

// (B) admin createUser (bypasses email + endpoint rate limit)
console.log("\n--- (B) admin.createUser (bypasses email) ---");
const email2 = `diag_admin_${Math.random().toString(36).slice(2, 8)}@example.com`;
const b = await admin.auth.admin.createUser({
  email: email2, password: "Password123!", email_confirm: true,
  user_metadata: { role: "brand", full_name: "Diag Admin Brand" },
});
if (b.error) {
  console.log("  status:", b.error.status, "| msg:", b.error.message);
} else {
  console.log("  OK -> user id:", b.data.user?.id);
  // cleanup
  await admin.auth.admin.deleteUser(b.data.user.id);
  console.log("  (cleaned up)");
}
