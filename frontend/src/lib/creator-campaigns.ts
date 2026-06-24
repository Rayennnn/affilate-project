import { createSupabaseServer } from "@/lib/supabase/server";
import { getOrCreateCreatorId } from "@/lib/creator";
import { products } from "@/data/products";

const PRODUCT_IMAGES = products.map((p) => p.image);

export type MatchStatus = "none" | "pending" | "approved" | "rejected" | "completed";

export type BrowseCampaign = {
  id: string;
  productName: string;
  productUrl: string;
  imageUrl: string;
  brandName: string;
  commissionRate: number;
  status: MatchStatus;
  linkUrl: string | null;
};

export type BrowseData = {
  creatorId: string | null;
  campaigns: BrowseCampaign[];
  avgCommission: number;
};

const EMPTY: BrowseData = { creatorId: null, campaigns: [], avgCommission: 0 };

export async function getBrowseCampaigns(): Promise<BrowseData> {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return EMPTY;

    const creatorId = await getOrCreateCreatorId(supabase, user.id);

    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, product_name, product_url, product_image_url, commission_rate, brands(store_name)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    let matchByCampaign = new Map<string, string>();
    let linkByCampaign = new Map<string, string>();

    if (creatorId) {
      const { data: matches } = await supabase
        .from("matches")
        .select("campaign_id, status")
        .eq("creator_id", creatorId);
      matchByCampaign = new Map((matches ?? []).map((m) => [m.campaign_id, m.status]));

      const { data: links } = await supabase
        .from("affiliate_links")
        .select("campaign_id, full_url")
        .eq("creator_id", creatorId);
      linkByCampaign = new Map((links ?? []).map((l) => [l.campaign_id, l.full_url]));
    }

    const rows = campaigns ?? [];
    const mapped: BrowseCampaign[] = rows.map((c, i) => {
      const brand = c.brands as { store_name?: string } | null;
      const status = (matchByCampaign.get(c.id) as MatchStatus) ?? "none";
      return {
        id: c.id,
        productName: c.product_name,
        productUrl: c.product_url,
        imageUrl: c.product_image_url || PRODUCT_IMAGES[i % PRODUCT_IMAGES.length],
        brandName: brand?.store_name ?? "Brand",
        commissionRate: Number(c.commission_rate ?? 0),
        status,
        linkUrl: linkByCampaign.get(c.id) ?? null,
      };
    });

    const avgCommission =
      mapped.length > 0
        ? Math.round((mapped.reduce((s, c) => s + c.commissionRate, 0) / mapped.length) * 10) / 10
        : 0;

    return { creatorId, campaigns: mapped, avgCommission };
  } catch {
    return EMPTY;
  }
}
