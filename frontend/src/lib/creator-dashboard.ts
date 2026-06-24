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

// A flat zero baseline (recent dates) used when the creator has no earnings yet,
// so the chart renders intentionally empty instead of falling back to demo data.
function flatBaseline(count: number): ChartBar[] {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (count - 1 - i));
    return {
      label: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      value: 0,
    };
  });
}

// A fully zeroed dashboard for a creator with no activity yet (real, not demo).
function emptyDashboard(): CreatorDashboardData {
  const nextPayoutDate = new Date();
  nextPayoutDate.setDate(15);
  if (nextPayoutDate < new Date()) {
    nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
  }
  return {
    stats: [
      { label: "Total Earned", value: "$0.00" },
      { label: "Total Clicks", value: "0" },
      { label: "Conversions", value: "0" },
      { label: "Active Links", value: "0" },
    ],
    links: [],
    topProducts: [],
    nextPayout: {
      amount: "$0.00",
      date: `Scheduled for ${nextPayoutDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
    },
    chartWeek: flatBaseline(7),
    chartMonth: flatBaseline(15),
  };
}

function buildChartFromDaily(
  daily: { date: string; amount: number }[],
  count: number,
): ChartBar[] {
  const slice = daily.slice(-count);
  if (slice.length === 0) return flatBaseline(count);

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

export function getDemoDashboardData(): CreatorDashboardData {
  return {
    stats: [
      { label: "Total Earned", value: "$4,250", change: { value: "+12%", positive: true } },
      { label: "Total Clicks", value: "12.4k", change: { value: "+5%", positive: true } },
      { label: "Conversions", value: "342", change: { value: "-2%", positive: false } },
      { label: "Active Links", value: "18", status: "Stable" },
    ],
    links: [
      {
        refCode: "a7c3f9d1",
        fullUrl: "https://shop.converty.shop/p/pro-studio-anc?ref=a7c3f9d1",
        productName: "Pro Studio ANC",
        category: "Electronics",
        brandName: "SoundCore",
        commissionRate: 15,
        clicks: 1240,
        earnings: 842,
        image: PRODUCT_IMAGES[0],
      },
      {
        refCode: "b8d4e0f2",
        fullUrl: "https://shop.converty.shop/p/vlog-kit-xl?ref=b8d4e0f2",
        productName: "Vlog Kit XL",
        category: "Camera",
        brandName: "OpticLens",
        commissionRate: 12,
        clicks: 842,
        earnings: 504,
        image: PRODUCT_IMAGES[3],
      },
      {
        refCode: "c9e5f1a3",
        fullUrl: "https://shop.converty.shop/p/ultrapod-pro?ref=c9e5f1a3",
        productName: "UltraPod Pro",
        category: "Audio",
        brandName: "AudioWave",
        commissionRate: 18,
        clicks: 3102,
        earnings: 1450,
        image: PRODUCT_IMAGES[0],
      },
      {
        refCode: "d0f6a2b4",
        fullUrl: "https://shop.converty.shop/p/focus-hub?ref=d0f6a2b4",
        productName: "Focus Hub",
        category: "Software",
        brandName: "ZenSoft",
        commissionRate: 20,
        clicks: 410,
        earnings: 320,
        image: PRODUCT_IMAGES[1],
      },
    ],
    topProducts: [
      { rank: "01", name: "UltraPod Pro", category: "Electronics", revenue: "$1.2k Revenue", change: "+18%", positive: true },
      { rank: "02", name: "Vlog Kit XL", category: "Camera", revenue: "$940 Revenue", change: "+12%", positive: true },
      { rank: "03", name: "Focus Hub", category: "Software", revenue: "$720 Revenue", change: "-4%", positive: false },
    ],
    nextPayout: { amount: "$1,240.00", date: "Scheduled for June 15th" },
    chartWeek: [
      { label: "Mon", value: 43 },
      { label: "Tue", value: 57 },
      { label: "Wed", value: 74 },
      { label: "Thu", value: 100, highlight: true, tooltip: "Peak Performance: $420/day" },
      { label: "Fri", value: 86 },
      { label: "Sat", value: 69 },
      { label: "Sun", value: 52 },
    ],
    chartMonth: [
      { label: "1", value: 28 },
      { label: "3", value: 42 },
      { label: "5", value: 35 },
      { label: "7", value: 55 },
      { label: "9", value: 48 },
      { label: "11", value: 62 },
      { label: "13", value: 58 },
      { label: "15", value: 74 },
      { label: "17", value: 68 },
      { label: "19", value: 82 },
      { label: "21", value: 76 },
      { label: "23", value: 100, highlight: true, tooltip: "Peak Performance: $420/day" },
      { label: "25", value: 88 },
      { label: "27", value: 92 },
      { label: "30", value: 85 },
    ],
  };
}

export async function getCreatorDashboardData(): Promise<CreatorDashboardData> {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return emptyDashboard();

    // Make sure the logged-in creator has a creators row (onboarding). Without
    // it the dashboard could never show real data. RLS lets a creator insert
    // their own row (profile_id = auth.uid()).
    let creator: { id: string; niche: string | null; is_verified: boolean | null } | null = null;
    const { data: existing } = await supabase
      .from("creators")
      .select("id, niche, is_verified")
      .eq("profile_id", user.id)
      .maybeSingle();
    creator = existing;

    if (!creator) {
      const { data: created } = await supabase
        .from("creators")
        .insert({ profile_id: user.id, niche: "general" })
        .select("id, niche, is_verified")
        .maybeSingle();
      creator = created ?? null;
    }

    // No creator row (e.g. insert blocked) -> real empty dashboard, not demo.
    if (!creator) return emptyDashboard();

    const { data: rows } = await supabase
      .from("creator_dashboard")
      .select("*")
      .eq("creator_id", creator.id)
      .not("ref_code", "is", null);

    const linkRows = (rows ?? []).filter((r) => r.ref_code);

    // No approved affiliate links yet -> show the real zero state.
    if (linkRows.length === 0) return emptyDashboard();

    const totalEarned = linkRows.reduce((sum, r) => sum + Number(r.total_earned ?? 0), 0);
    const totalClicks = linkRows.reduce((sum, r) => sum + Number(r.clicks ?? 0), 0);
    const totalConversions = linkRows.reduce(
      (sum, r) => sum + Number(r.total_conversions ?? 0),
      0,
    );
    const pendingPayout = linkRows.reduce(
      (sum, r) => sum + Number(r.pending_payout ?? 0),
      0,
    );

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

    const sortedBySales = [...linkRows].sort(
      (a, b) => Number(b.total_sales ?? 0) - Number(a.total_sales ?? 0),
    );

    const topProducts: TopProduct[] = sortedBySales.slice(0, 3).map((row, index) => {
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

    const chartWeek = buildChartFromDaily(daily, 7);
    const chartMonth = buildChartFromDaily(daily, 15);

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
        { label: "Active Links", value: String(linkRows.length) },
      ],
      links,
      topProducts,
      nextPayout: {
        amount: formatCurrency(pendingPayout),
        date: `Scheduled for ${nextPayoutDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
      },
      chartWeek,
      chartMonth,
    };
  } catch {
    return emptyDashboard();
  }
}
