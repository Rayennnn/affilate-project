import { createSupabaseServer } from "@/lib/supabase/server";
import { getOrCreateCreatorId } from "@/lib/creator";
import { products } from "@/data/products";
import type { AffiliateLinkRow } from "@/lib/creator-dashboard";

const PRODUCT_IMAGES = products.map((p) => p.image);

export type CreatorLinksData = {
  links: AffiliateLinkRow[];
  totalClicks: number;
  totalEarned: number;
  totalConversions: number;
};

const EMPTY: CreatorLinksData = { links: [], totalClicks: 0, totalEarned: 0, totalConversions: 0 };

export async function getCreatorLinks(): Promise<CreatorLinksData> {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return EMPTY;

    const creatorId = await getOrCreateCreatorId(supabase, user.id);
    if (!creatorId) return EMPTY;

    const { data: rows } = await supabase
      .from("creator_dashboard")
      .select("*")
      .eq("creator_id", creatorId)
      .not("ref_code", "is", null);

    const linkRows = (rows ?? []).filter((r) => r.ref_code);

    const links: AffiliateLinkRow[] = linkRows
      .sort((a, b) => Number(b.total_earned ?? 0) - Number(a.total_earned ?? 0))
      .map((row, i) => ({
        refCode: row.ref_code,
        fullUrl: row.full_url,
        productName: row.product_name ?? "Product",
        category: row.brand_name ?? "General",
        brandName: row.brand_name ?? "Brand",
        commissionRate: Number(row.commission_rate ?? 0),
        clicks: Number(row.clicks ?? 0),
        earnings: Number(row.total_earned ?? 0),
        image: PRODUCT_IMAGES[i % PRODUCT_IMAGES.length],
      }));

    return {
      links,
      totalClicks: linkRows.reduce((s, r) => s + Number(r.clicks ?? 0), 0),
      totalEarned: linkRows.reduce((s, r) => s + Number(r.total_earned ?? 0), 0),
      totalConversions: linkRows.reduce((s, r) => s + Number(r.total_conversions ?? 0), 0),
    };
  } catch {
    return EMPTY;
  }
}
