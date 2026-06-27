import { createSupabaseServer } from "@/lib/supabase/server";

export type MarketplaceCampaign = {
  id: string;
  productName: string;
  productUrl: string;
  imageUrl: string | null;
  commissionRate: number;
  brandName: string;
  /** null = not applied, otherwise the match status (pending/approved/rejected/completed) */
  matchStatus: string | null;
};

export type MarketplaceData = {
  creatorId: string | null;
  campaigns: MarketplaceCampaign[];
  avgCommission: number;
};

export async function getMarketplaceData(): Promise<MarketplaceData> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { creatorId: null, campaigns: [], avgCommission: 0 };

  const { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  // Active campaigns are visible to creators via RLS.
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, product_name, product_url, product_image_url, commission_rate, brands(store_name)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const creatorId = creator?.id ?? null;

  // The creator's existing applications, to mark each campaign's state.
  const matchMap = new Map<string, string>();
  if (creatorId) {
    const { data: matches } = await supabase
      .from("matches")
      .select("campaign_id, status")
      .eq("creator_id", creatorId);
    for (const m of matches ?? []) {
      matchMap.set(m.campaign_id as string, m.status as string);
    }
  }

  const rows: MarketplaceCampaign[] = (campaigns ?? []).map((c) => {
    const brand = c.brands as { store_name?: string } | null;
    return {
      id: c.id as string,
      productName: c.product_name ?? "Product",
      productUrl: c.product_url ?? "#",
      imageUrl: c.product_image_url ?? null,
      commissionRate: Number(c.commission_rate ?? 0),
      brandName: brand?.store_name ?? "Brand",
      matchStatus: matchMap.get(c.id as string) ?? null,
    };
  });

  const avgCommission =
    rows.length > 0
      ? Math.round((rows.reduce((s, r) => s + r.commissionRate, 0) / rows.length) * 10) / 10
      : 0;

  return { creatorId, campaigns: rows, avgCommission };
}
