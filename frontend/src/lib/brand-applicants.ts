import { createSupabaseServer } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";

export type Applicant = {
  matchId: string;
  status: string;
  campaignName: string;
  niche: string;
  bio: string | null;
  audienceSize: number;
  instagramUrl: string | null;
  isVerified: boolean;
  appliedAt: string;
};

export type ApplicantsData = {
  hasBrand: boolean;
  applicants: Applicant[];
};

export async function getApplicants(): Promise<ApplicantsData> {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { hasBrand: false, applicants: [] };

    const brand = await getBrand(supabase, user.id);
    if (!brand) return { hasBrand: false, applicants: [] };

    // RLS restricts matches to those on the brand's own campaigns.
    const { data: rows } = await supabase
      .from("matches")
      .select(
        "id, status, created_at, campaigns(product_name), creators(niche, bio, audience_size, instagram_url, is_verified)",
      )
      .order("created_at", { ascending: false });

    const applicants: Applicant[] = (rows ?? []).map((m) => {
      const campaign = m.campaigns as { product_name?: string } | null;
      const creator = m.creators as {
        niche?: string;
        bio?: string | null;
        audience_size?: number;
        instagram_url?: string | null;
        is_verified?: boolean;
      } | null;
      return {
        matchId: m.id,
        status: m.status,
        campaignName: campaign?.product_name ?? "Campaign",
        niche: creator?.niche ?? "general",
        bio: creator?.bio ?? null,
        audienceSize: Number(creator?.audience_size ?? 0),
        instagramUrl: creator?.instagram_url ?? null,
        isVerified: Boolean(creator?.is_verified),
        appliedAt: new Date(m.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
    });

    return { hasBrand: true, applicants };
  } catch {
    return { hasBrand: false, applicants: [] };
  }
}
