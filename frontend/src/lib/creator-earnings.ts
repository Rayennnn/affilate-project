import { createSupabaseServer } from "@/lib/supabase/server";

export type EarningRow = {
  id: string;
  productName: string;
  saleAmount: number;
  commission: number;
  status: string;
  date: string;
};

export type PayoutRow = {
  id: string;
  amount: number;
  status: string;
  reference: string | null;
  periodStart: string | null;
  periodEnd: string | null;
};

export type EarningsData = {
  hasCreator: boolean;
  totalEarned: number;
  pending: number;
  paid: number;
  conversions: EarningRow[];
  payouts: PayoutRow[];
};

const EMPTY: EarningsData = {
  hasCreator: false,
  totalEarned: 0,
  pending: 0,
  paid: 0,
  conversions: [],
  payouts: [],
};

export async function getCreatorEarnings(): Promise<EarningsData> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EMPTY;

  const { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!creator) return EMPTY;

  const { data: convRows } = await supabase
    .from("conversions")
    .select("id, sale_amount, commission_amount, status, created_at, campaigns(product_name)")
    .eq("creator_id", creator.id)
    .order("created_at", { ascending: false });

  const { data: payoutRows } = await supabase
    .from("payouts")
    .select("id, amount, status, reference, period_start, period_end")
    .eq("creator_id", creator.id)
    .order("created_at", { ascending: false });

  const conversions: EarningRow[] = (convRows ?? []).map((c) => {
    const campaign = c.campaigns as { product_name?: string } | null;
    return {
      id: c.id as string,
      productName: campaign?.product_name ?? "Sale",
      saleAmount: Number(c.sale_amount ?? 0),
      commission: Number(c.commission_amount ?? 0),
      status: c.status as string,
      date: c.created_at as string,
    };
  });

  const payouts: PayoutRow[] = (payoutRows ?? []).map((p) => ({
    id: p.id as string,
    amount: Number(p.amount ?? 0),
    status: p.status as string,
    reference: p.reference ?? null,
    periodStart: p.period_start ?? null,
    periodEnd: p.period_end ?? null,
  }));

  const totalEarned = conversions
    .filter((c) => c.status !== "cancelled")
    .reduce((s, c) => s + c.commission, 0);
  const pending = conversions
    .filter((c) => c.status === "confirmed")
    .reduce((s, c) => s + c.commission, 0);
  const paid = conversions
    .filter((c) => c.status === "paid")
    .reduce((s, c) => s + c.commission, 0);

  return { hasCreator: true, totalEarned, pending, paid, conversions, payouts };
}
