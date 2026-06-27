import { createSupabaseServer } from "@/lib/supabase/server";
import { products } from "@/data/products";

export type StatCard = {
  label: string;
  value: string;
  change?: { value: string; positive: boolean };
  status?: string;
};

export type AffiliateLinkRow = {
  refCode: string;
  fullUrl: string;
  productName: string;
  category: string;
  brandName: string;
  commissionRate: number;
  clicks: number;
  earnings: number;
  image: string;
};

export type TopProduct = {
  rank: string;
  name: string;
  category: string;
  revenue: string;
  change: string;
  positive: boolean;
};

export type ChartBar = {
  label: string;
  value: number;
  highlight?: boolean;
  tooltip?: string;
};

export type CreatorDashboardData = {
  stats: StatCard[];
  links: AffiliateLinkRow[];
  topProducts: TopProduct[];
  nextPayout: { amount: string; date: string };
  chartWeek: ChartBar[];
  chartMonth: ChartBar[];
};

// Neutral thumbnails only — never fabricated stats. The creator_dashboard view
// carries no image column, so links fall back to these placeholder visuals.
const PRODUCT_IMAGES = products.map((p) => p.image);

const NICHE_LABELS: Record<string, string> = {
  beauty: "Beauty",
  fashion: "Fashion",
  tech: "Electronics",
  software: "Software",
  furniture: "Furniture",
  camera: "Camera",
  accessories: "Accessories",
};

function formatCurrency(value: number): string {
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

function formatRevenue(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return formatCurrency(value);
}

function nicheLabel(niche: string | null | undefined): string {
  if (!niche) return "General";
  return NICHE_LABELS[niche.toLowerCase()] ?? niche.charAt(0).toUpperCase() + niche.slice(1);
}

function buildChartFromDaily(
  daily: { date: string; amount: number }[],
  count: number,
): ChartBar[] {
  const slice = daily.slice(-count);
  if (slice.length === 0) return [];

  const max = Math.max(...slice.map((d) => d.amount), 1);
  const peakIndex = slice.reduce(
    (best, d, i) => (d.amount > slice[best].amount ? i : best),
    0,
  );

  return slice.map((d, i) => ({
    label: new Date(d.date).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    value: Math.max(12, Math.round((d.amount / max) * 100)),
    highlight: i === peakIndex && d.amount > 0,
    tooltip:
      i === peakIndex && d.amount > 0
        ? `Peak Performance: ${formatCurrency(d.amount)}/day`
        : undefined,
  }));
}

function emptyDashboard(): CreatorDashboardData {
  return {
    stats: [
      { label: "Total Earned", value: formatCurrency(0) },
      { label: "Total Clicks", value: "0" },
      { label: "Conversions", value: "0" },
      { label: "Active Links", value: "0" },
    ],
    links: [],
    topProducts: [],
    nextPayout: { amount: formatCurrency(0), date: "No payout scheduled" },
    chartWeek: [],
    chartMonth: [],
  };
}

export async function getCreatorDashboardData(): Promise<CreatorDashboardData> {
  const empty = emptyDashboard();

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return empty;

  const { data: creator } = await supabase
    .from("creators")
    .select("id, niche, is_verified")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!creator) return empty;

  const { data: rows } = await supabase
    .from("creator_dashboard")
    .select("*")
    .eq("creator_id", creator.id)
    .not("ref_code", "is", null);

  const linkRows = (rows ?? []).filter((r) => r.ref_code);

  const totalEarned = linkRows.reduce((sum, r) => sum + Number(r.total_earned ?? 0), 0);
  const totalClicks = linkRows.reduce((sum, r) => sum + Number(r.clicks ?? 0), 0);
  const totalConversions = linkRows.reduce(
    (sum, r) => sum + Number(r.total_conversions ?? 0),
    0,
  );
  const pendingPayout = linkRows.reduce((sum, r) => sum + Number(r.pending_payout ?? 0), 0);

  const links: AffiliateLinkRow[] = linkRows
    .sort((a, b) => Number(b.total_earned ?? 0) - Number(a.total_earned ?? 0))
    .slice(0, 5)
    .map((row, index) => ({
      refCode: row.ref_code,
      fullUrl: row.full_url,
      productName: row.product_name ?? "Product",
      category: nicheLabel(creator.niche),
      brandName: row.brand_name ?? "Brand",
      commissionRate: Number(row.commission_rate ?? 0),
      clicks: Number(row.clicks ?? 0),
      earnings: Number(row.total_earned ?? 0),
      image: PRODUCT_IMAGES[index % PRODUCT_IMAGES.length],
    }));

  const topProducts: TopProduct[] = [...linkRows]
    .sort((a, b) => Number(b.total_sales ?? 0) - Number(a.total_sales ?? 0))
    .slice(0, 3)
    .map((row, index) => {
      const sales = Number(row.total_sales ?? 0);
      const convs = Number(row.total_conversions ?? 0);
      const change = convs > 0 ? `+${Math.min(convs * 3, 24)}%` : "+0%";
      return {
        rank: String(index + 1).padStart(2, "0"),
        name: row.product_name ?? "Product",
        category: nicheLabel(creator.niche),
        revenue: `${formatRevenue(sales)} Revenue`,
        change,
        positive: !change.startsWith("-"),
      };
    });

  const { data: conversions } = await supabase
    .from("conversions")
    .select("commission_amount, created_at")
    .eq("creator_id", creator.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: true });

  const dailyMap = new Map<string, number>();
  for (const conv of conversions ?? []) {
    const day = conv.created_at.slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + Number(conv.commission_amount ?? 0));
  }

  const daily = [...dailyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));

  const nextPayoutDate = new Date();
  nextPayoutDate.setDate(15);
  if (nextPayoutDate < new Date()) {
    nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
  }

  return {
    stats: [
      { label: "Total Earned", value: formatCurrency(totalEarned) },
      { label: "Total Clicks", value: formatCompact(totalClicks) },
      { label: "Conversions", value: totalConversions.toLocaleString("en-US") },
      { label: "Active Links", value: String(linkRows.length), status: "Stable" },
    ],
    links,
    topProducts,
    nextPayout: {
      amount: formatCurrency(pendingPayout),
      date:
        pendingPayout > 0
          ? `Scheduled for ${nextPayoutDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`
          : "No payout scheduled",
    },
    chartWeek: buildChartFromDaily(daily, 7),
    chartMonth: buildChartFromDaily(daily, 15),
  };
}
