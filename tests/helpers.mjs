// Shared test helpers. Tests run against the LIVE Supabase project using the
// values in .env (loaded via `node --env-file=.env`). Every test creates its
// own throwaway users and deletes them in teardown (cascade cleans the rest).
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON || !SERVICE) {
  throw new Error(
    "Missing SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY. " +
      "Run via `npm test` (it passes --env-file=.env).",
  );
}

export const FUNCTIONS_URL = `${URL}/functions/v1`;
export const SERVICE_KEY = SERVICE;

// Service-role client: bypasses RLS. Used for setup/teardown + trigger checks.
export const admin = () =>
  createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

// Anon client: respects RLS. Sign in on it to test policies as a real user.
export const anon = () =>
  createClient(URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });

export const uniq = () => Math.random().toString(36).slice(2, 8);
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Create an auth user; the handle_new_user trigger auto-creates its profile.
export async function createUser({ role, full_name = "Test User", password = "Password123!" }) {
  const email = `test_${uniq()}@example.test`;
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, full_name },
  });
  if (error) throw error;
  return { id: data.user.id, email, password };
}

export async function deleteUser(id) {
  if (!id) return;
  try {
    await admin().auth.admin.deleteUser(id);
  } catch { /* best-effort */ }
}

// Sign in and return a usable anon client already bound to the user session.
export async function clientFor(email, password) {
  const c = anon();
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return c;
}

// Call an edge function. redirect:"manual" so we can assert on 302s.
export async function fnFetch(path, { method = "POST", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${FUNCTIONS_URL}/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, json, location: res.headers.get("location") };
}

// Poll a query until predicate passes or timeout (for async/eventual effects).
export async function pollUntil(fn, predicate, { tries = 15, delay = 500 } = {}) {
  let last;
  for (let i = 0; i < tries; i++) {
    last = await fn();
    if (predicate(last)) return last;
    await sleep(delay);
  }
  return last;
}
