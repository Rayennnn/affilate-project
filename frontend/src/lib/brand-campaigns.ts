import { createSupabaseServer } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";

export type CampaignItem = {
  id: string;
  productName: string;
  productUrl: string;
  productImageUrl: string | null;
  commissionRate: number;
  platformFeeRate: number;
  budget: number;
  spent: number;
  status: string;
};

export type BrandCampaignsData = {
  hasBrand: boolean;
  brandId: string | null;
  campaigns: CampaignItem[];
};

export async function getBrandCampaigns(): Promise<BrandCampaignsData> {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { hasBrand: false, brandId: null, campaigns: [] };

    const brand = await getBrand(supabase, user.id);
    if (!brand) return { hasBrand: false, brandId: null, campaigns: [] };

    const { data: rows } = await supabase
      .from("campaigns")
      .select(
        "id, product_name, product_url, product_image_url, commission_rate, platform_fee_rate, budget, spent, status",
      )
      .eq("brand_id", brand.id)
      .order("created_at", { ascending: false });

    const campaigns: CampaignItem[] = (rows ?? []).map((c) => ({
      id: c.id,
      productName: c.product_name,
      productUrl: c.product_url,
      productImageUrl: c.product_image_url,
      commissionRate: Number(c.commission_rate ?? 0),
      platformFeeRate: Number(c.platform_fee_rate ?? 0),
      budget: Number(c.budget ?? 0),
      spent: Number(c.spent ?? 0),
      status: c.status,
    }));

    return { hasBrand: true, brandId: brand.id, campaigns };
  } catch {
    return { hasBrand: false, brandId: null, campaigns: [] };
  }
}
