import { createSupabaseServer } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServer>>;

export type BrandRow = {
  id: string;
  store_name: string;
  store_url: string;
  description: string | null;
  gtm_id: string | null;
  logo_url: string | null;
  is_verified: boolean | null;
};

// Returns the logged-in user's brand row, or null if they haven't set up their
// store yet. Unlike creators we can't auto-create it (store_name/store_url are
// required) — onboarding happens in Settings.
export async function getBrand(supabase: ServerClient, userId: string): Promise<BrandRow | null> {
  const { data } = await supabase
    .from("brands")
    .select("id, store_name, store_url, description, gtm_id, logo_url, is_verified")
    .eq("profile_id", userId)
    .maybeSingle();
  return data ?? null;
}
