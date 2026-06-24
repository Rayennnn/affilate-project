import { createSupabaseServer } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";

export type BrandCampaignRow = {
  id: string;
  name: string;
  status: string;
  budget: number;
  spent: number;
  activeCreators: number;
  conversions: number;
  sales: number;
  commissionsDue: number;
};

export type BrandDashboardData = {
  hasBrand: boolean;
  storeName: string;
  isVerified: boolean;
  totals: {
    campaigns: number;
    activeCreators: number;
    conversions: number;
    sales: number;
    commissionsDue: number;
  };
  campaigns: BrandCampaignRow[];
};

const EMPTY: BrandDashboardData = {
  hasBrand: false,
  storeName: "",
  isVerified: false,
  totals: { campaigns: 0, activeCreators: 0, conversions: 0, sales: 0, commissionsDue: 0 },
  campaigns: [],
};

export async function getBrandDashboard(): Promise<BrandDashboardData> {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return EMPTY;

    const brand = await getBrand(supabase, user.id);
    if (!brand) return EMPTY;

    const { data: rows } = await supabase
      .from("brand_dashboard")
      .select("*")
      .eq("brand_id", brand.id);

    const campaignRows = (rows ?? []).filter((r) => r.campaign_id);

    const campaigns: BrandCampaignRow[] = campaignRows.map((r) => ({
      id: r.campaign_id,
      name: r.product_name ?? "Untitled",
      status: r.campaign_status ?? "draft",
      budget: Number(r.budget ?? 0),
      spent: Number(r.spent ?? 0),
      activeCreators: Number(r.active_creators ?? 0),
      conversions: Number(r.total_conversions ?? 0),
      sales: Number(r.total_sales ?? 0),
      commissionsDue: Number(r.total_commissions_due ?? 0),
    }));

    return {
      hasBrand: true,
      storeName: brand.store_name,
      isVerified: Boolean(brand.is_verified),
      totals: {
        campaigns: campaigns.length,
        activeCreators: campaigns.reduce((s, c) => s + c.activeCreators, 0),
        conversions: campaigns.reduce((s, c) => s + c.conversions, 0),
        sales: campaigns.reduce((s, c) => s + c.sales, 0),
        commissionsDue: campaigns.reduce((s, c) => s + c.commissionsDue, 0),
      },
      campaigns,
    };
  } catch {
    return EMPTY;
  }
}
