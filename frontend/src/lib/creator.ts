import { createSupabaseServer } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServer>>;

// Returns the logged-in creator's id, creating their `creators` row on first
// access (onboarding). RLS lets a creator insert their own row. Returns null
// if there is no session or the insert is blocked.
export async function getOrCreateCreatorId(
  supabase: ServerClient,
  userId: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("creators")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("creators")
    .insert({ profile_id: userId, niche: "general" })
    .select("id")
    .maybeSingle();
  return created?.id ?? null;
}
