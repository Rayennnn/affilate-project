import { createSupabaseServer } from "@/lib/supabase/server";

export type Applicant = {
  matchId: string;
  status: string;
  appliedAt: string;
  campaignId: string;
  productName: string;
  creatorId: string;
  niche: string;
  bio: string;
  audienceSize: number;
  isVerified: boolean;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
};

export type ApplicantsData = {
  hasBrand: boolean;
  applicants: Applicant[];
};

export async function getApplicants(): Promise<ApplicantsData> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { hasBrand: false, applicants: [] };

  const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!brand) return { hasBrand: false, applicants: [] };

  // RLS restricts these to matches on the brand's own campaigns.
  const { data: matches } = await supabase
    .from("matches")
    .select(
      "id, status, created_at, campaign_id, campaigns(product_name), creator_id, creators(niche, bio, audience_size, is_verified, instagram_url, tiktok_url, youtube_url)",
    )
    .order("created_at", { ascending: false });

  const applicants: Applicant[] = (matches ?? []).map((m) => {
    const campaign = m.campaigns as { product_name?: string } | null;
    const creator = m.creators as {
      niche?: string;
      bio?: string;
      audience_size?: number;
      is_verified?: boolean;
      instagram_url?: string | null;
      tiktok_url?: string | null;
      youtube_url?: string | null;
    } | null;
    return {
      matchId: m.id as string,
      status: m.status as string,
      appliedAt: m.created_at as string,
      campaignId: m.campaign_id as string,
      productName: campaign?.product_name ?? "Campaign",
      creatorId: m.creator_id as string,
      niche: creator?.niche ?? "general",
      bio: creator?.bio ?? "",
      audienceSize: Number(creator?.audience_size ?? 0),
      isVerified: Boolean(creator?.is_verified),
      instagramUrl: creator?.instagram_url ?? null,
      tiktokUrl: creator?.tiktok_url ?? null,
      youtubeUrl: creator?.youtube_url ?? null,
    };
  });

  return { hasBrand: true, applicants };
}
