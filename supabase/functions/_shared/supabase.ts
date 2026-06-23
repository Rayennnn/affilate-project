// Shared Supabase client factories for edge functions.
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Full-access client that bypasses RLS. Use ONLY in trusted/admin paths.
export function serviceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// RLS-respecting client bound to the caller's JWT (from the Authorization header).
export function userClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get("Authorization") ?? "";
  return createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Returns the authenticated profile for the request, or null if not an admin.
// Used by admin-only endpoints to verify the caller before doing service-role work.
export async function requireAdmin(
  req: Request,
): Promise<{ ok: true; userId: string } | { ok: false; status: number; error: string }> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false, status: 401, error: "Not authenticated" };

  // Decode the JWT payload. For these functions verify_jwt=true, so the
  // platform gateway has already cryptographically verified the signature
  // before we run — reading the claims here is safe.
  let claims: Record<string, unknown> = {};
  try {
    claims = JSON.parse(atob(token.split(".")[1]));
  } catch { /* not a JWT we can parse */ }

  // Allow direct service_role calls (e.g. CRON / server-to-server).
  if (claims.role === "service_role" || token === SERVICE_ROLE_KEY) {
    return { ok: true, userId: "service_role" };
  }

  const supabase = userClient(req);
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return { ok: false, status: 401, error: "Not authenticated" };
  }

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profErr || profile?.role !== "admin") {
    return { ok: false, status: 403, error: "Admin access required" };
  }
  return { ok: true, userId: userData.user.id };
}
