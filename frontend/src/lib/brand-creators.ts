import { createSupabaseServer } from "@/lib/supabase/server";

export type CreatorCard = {
  id: string;
  name: string;
  niche: string;
  bio: string;
  audienceSize: number;
  isVerified: boolean;
  avatarUrl: string;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
};

const FALLBACK_AVATARS = [
  "https://i.pravatar.cc/160?img=12",
  "https://i.pravatar.cc/160?img=32",
  "https://i.pravatar.cc/160?img=5",
  "https://i.pravatar.cc/160?img=47",
  "https://i.pravatar.cc/160?img=24",
  "https://i.pravatar.cc/160?img=15",
];

export function formatAudience(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return value.toLocaleString("en-US");
}

export async function getCreators(): Promise<CreatorCard[]> {
  const supabase = await createSupabaseServer();

  const { data: creators } = await supabase
    .from("creators")
    .select(
      "id, niche, bio, audience_size, is_verified, instagram_url, tiktok_url, youtube_url, profile_id",
    )
    .order("audience_size", { ascending: false })
    .limit(24);

  if (!creators || creators.length === 0) return [];

  // Brands cannot read creator profiles via RLS, so names/avatars may be absent.
  const profileIds = creators.map((c) => c.profile_id).filter(Boolean);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", profileIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return creators.map((c, index) => {
    const profile = profileMap.get(c.profile_id);
    return {
      id: c.id as string,
      name: profile?.full_name ?? `${(c.niche ?? "UGC").charAt(0).toUpperCase()}${(c.niche ?? "GC").slice(1)} creator`,
      niche: c.niche ?? "general",
      bio: c.bio ?? "Content creator on the Creatorly network.",
      audienceSize: Number(c.audience_size ?? 0),
      isVerified: Boolean(c.is_verified),
      avatarUrl: profile?.avatar_url ?? FALLBACK_AVATARS[index % FALLBACK_AVATARS.length],
      instagramUrl: c.instagram_url ?? null,
      tiktokUrl: c.tiktok_url ?? null,
      youtubeUrl: c.youtube_url ?? null,
    };
  });
}
