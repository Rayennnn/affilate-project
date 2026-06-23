import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getDashboardPath, type UserRole } from "@/lib/auth-redirect";

// OAuth (PKCE) callback. Google redirects here with ?code=...; we exchange it
// for a session (cookies), optionally apply the role chosen at sign-up, then
// forward the user to their role's dashboard.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const roleParam = searchParams.get("role");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  // "Sign up with Google" passes ?role=; OAuth users default to 'creator'
  // otherwise. Never allow self-assigning 'admin'.
  if (roleParam === "creator" || roleParam === "brand") {
    await supabase.from("profiles").update({ role: roleParam }).eq("id", data.user.id);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  const role = (profile?.role as UserRole) ?? (roleParam as UserRole) ?? "creator";

  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}${getDashboardPath(role)}`);
}
