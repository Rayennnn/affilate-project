import { createSupabaseServer } from "@/lib/supabase/server";

export type BrandStat = {
  label: string;
  value: string;
  change?: { value: string; positive: boolean };
  status?: string;
};

export type CampaignRow = {
  id: string;
  productName: string;
  status: string;
  budget: number;
  spent: number;
  activeCreators: number;
  conversions: number;
  sales: number;
  commissionsDue: number;
};

export type BrandDashboardData = {
  storeName: string;
  stats: BrandStat[];
  campaigns: CampaignRow[];
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCompact(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return value.toLocaleString("en-US");
}

function buildStats(
  totalSales: number,
  totalConversions: number,
  totalCreators: number,
  commissionsDue: number,
): BrandStat[] {
  return [
    { label: "Total Sales", value: formatCurrency(totalSales) },
    { label: "Conversions", value: formatCompact(totalConversions) },
    { label: "Active Creators", value: totalCreators.toLocaleString("en-US") },
    { label: "Commissions Due", value: formatCurrency(commissionsDue), status: "Pending" },
  ];
}

export async function getBrandDashboardData(): Promise<BrandDashboardData> {
  const empty: BrandDashboardData = {
    storeName: "Your Store",
    stats: buildStats(0, 0, 0, 0),
    campaigns: [],
  };

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return empty;

  const { data: brand } = await supabase
    .from("brands")
    .select("id, store_name")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!brand) return empty;

  const storeName = brand.store_name ?? "Your Store";

  const { data: rows } = await supabase
    .from("brand_dashboard")
    .select("*")
    .eq("brand_id", brand.id);

  // Rows with a null campaign_id mean the brand has no campaigns yet.
  const campaignRows = (rows ?? []).filter((r) => r.campaign_id);

  const campaigns: CampaignRow[] = campaignRows
    .map((row) => ({
      id: row.campaign_id as string,
      productName: row.product_name ?? "Product",
      status: row.campaign_status ?? "draft",
      budget: Number(row.budget ?? 0),
      spent: Number(row.spent ?? 0),
      activeCreators: Number(row.active_creators ?? 0),
      conversions: Number(row.total_conversions ?? 0),
      sales: Number(row.total_sales ?? 0),
      commissionsDue: Number(row.total_commissions_due ?? 0),
    }))
    .sort((a, b) => b.sales - a.sales);

  const totalSales = campaigns.reduce((sum, c) => sum + c.sales, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const totalCreators = campaigns.reduce((sum, c) => sum + c.activeCreators, 0);
  const commissionsDue = campaigns.reduce((sum, c) => sum + c.commissionsDue, 0);

  return {
    storeName,
    stats: buildStats(totalSales, totalConversions, totalCreators, commissionsDue),
    campaigns,
  };
}
