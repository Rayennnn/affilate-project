import { createSupabaseServer } from "@/lib/supabase/server";

export type AdminOverview = {
  totalBrands: number;
  totalCreators: number;
  activeCampaigns: number;
  pendingConversions: number;
  totalSalesVolume: number;
  totalPlatformRevenue: number;
  pendingPayouts: number;
};

export type AdminBrand = {
  id: string;
  storeName: string;
  storeUrl: string;
  ownerName: string;
  ownerEmail: string;
  isVerified: boolean;
  createdAt: string;
};

export type AdminCreator = {
  id: string;
  name: string;
  email: string;
  niche: string;
  audienceSize: number;
  isVerified: boolean;
  createdAt: string;
};

export type AdminConversion = {
  id: string;
  productName: string;
  brandName: string;
  saleAmount: number;
  commission: number;
  platformFee: number;
  source: string;
  status: string;
  createdAt: string;
};

export type AdminPayout = {
  id: string;
  creatorName: string;
  amount: number;
  method: string;
  status: string;
  reference: string | null;
  periodStart: string;
  periodEnd: string;
};

export async function getAdminOverview(): Promise<AdminOverview | null> {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("admin_overview").select("*").maybeSingle();
  if (!data) return null;
  return {
    totalBrands: Number(data.total_brands ?? 0),
    totalCreators: Number(data.total_creators ?? 0),
    activeCampaigns: Number(data.active_campaigns ?? 0),
    pendingConversions: Number(data.pending_conversions ?? 0),
    totalSalesVolume: Number(data.total_sales_volume ?? 0),
    totalPlatformRevenue: Number(data.total_platform_revenue ?? 0),
    pendingPayouts: Number(data.pending_payouts ?? 0),
  };
}

export async function getAdminBrands(): Promise<AdminBrand[]> {
  const supabase = await createSupabaseServer();
  const { data: brands } = await supabase
    .from("brands")
    .select("id, store_name, store_url, is_verified, created_at, profile_id")
    .order("created_at", { ascending: false });

  if (!brands || brands.length === 0) return [];

  const profileMap = await fetchProfiles(
    supabase,
    brands.map((b) => b.profile_id),
  );

  return brands.map((b) => {
    const p = profileMap.get(b.profile_id);
    return {
      id: b.id as string,
      storeName: b.store_name ?? "—",
      storeUrl: b.store_url ?? "",
      ownerName: p?.full_name ?? "—",
      ownerEmail: p?.email ?? "",
      isVerified: Boolean(b.is_verified),
      createdAt: b.created_at as string,
    };
  });
}

export async function getAdminCreators(): Promise<AdminCreator[]> {
  const supabase = await createSupabaseServer();
  const { data: creators } = await supabase
    .from("creators")
    .select("id, niche, audience_size, is_verified, created_at, profile_id")
    .order("created_at", { ascending: false });

  if (!creators || creators.length === 0) return [];

  const profileMap = await fetchProfiles(
    supabase,
    creators.map((c) => c.profile_id),
  );

  return creators.map((c) => {
    const p = profileMap.get(c.profile_id);
    return {
      id: c.id as string,
      name: p?.full_name ?? "—",
      email: p?.email ?? "",
      niche: c.niche ?? "general",
      audienceSize: Number(c.audience_size ?? 0),
      isVerified: Boolean(c.is_verified),
      createdAt: c.created_at as string,
    };
  });
}

export async function getAdminConversions(): Promise<AdminConversion[]> {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("conversions")
    .select(
      "id, sale_amount, commission_amount, platform_fee, source, status, created_at, campaigns(product_name), brands(store_name)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (data ?? []).map((c) => {
    const campaign = c.campaigns as { product_name?: string } | null;
    const brand = c.brands as { store_name?: string } | null;
    return {
      id: c.id as string,
      productName: campaign?.product_name ?? "—",
      brandName: brand?.store_name ?? "—",
      saleAmount: Number(c.sale_amount ?? 0),
      commission: Number(c.commission_amount ?? 0),
      platformFee: Number(c.platform_fee ?? 0),
      source: c.source as string,
      status: c.status as string,
      createdAt: c.created_at as string,
    };
  });
}

export async function getAdminPayouts(): Promise<AdminPayout[]> {
  const supabase = await createSupabaseServer();
  const { data: payouts } = await supabase
    .from("payouts")
    .select(
      "id, amount, payout_method, status, reference, period_start, period_end, creators(profile_id)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (!payouts || payouts.length === 0) return [];

  const profileIds = payouts
    .map((p) => (p.creators as { profile_id?: string } | null)?.profile_id)
    .filter(Boolean) as string[];
  const profileMap = await fetchProfiles(supabase, profileIds);

  return payouts.map((p) => {
    const creator = p.creators as { profile_id?: string } | null;
    const profile = creator?.profile_id ? profileMap.get(creator.profile_id) : undefined;
    return {
      id: p.id as string,
      creatorName: profile?.full_name ?? "—",
      amount: Number(p.amount ?? 0),
      method: p.payout_method ?? "konnect",
      status: p.status as string,
      reference: p.reference ?? null,
      periodStart: p.period_start as string,
      periodEnd: p.period_end as string,
    };
  });
}

type ProfileLite = { full_name: string | null; email: string | null };

async function fetchProfiles(
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
  ids: (string | null | undefined)[],
): Promise<Map<string, ProfileLite>> {
  const cleanIds = [...new Set(ids.filter(Boolean) as string[])];
  if (cleanIds.length === 0) return new Map();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", cleanIds);
  return new Map((data ?? []).map((p) => [p.id as string, { full_name: p.full_name, email: p.email }]));
}
