import { createSupabaseServer } from "@/lib/supabase/server";
import { getOrCreateCreatorId } from "@/lib/creator";

export type EarningRow = {
  id: string;
  date: string;
  productName: string;
  saleAmount: number;
  commission: number;
  status: string;
};

export type PayoutRow = {
  id: string;
  amount: number;
  status: string;
  period: string;
  paidAt: string | null;
  reference: string | null;
};

export type CreatorEarningsData = {
  totalEarned: number;
  pending: number;
  paid: number;
  conversions: EarningRow[];
  payouts: PayoutRow[];
};

const EMPTY: CreatorEarningsData = {
  totalEarned: 0,
  pending: 0,
  paid: 0,
  conversions: [],
  payouts: [],
};

function fmtDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export async function getCreatorEarnings(): Promise<CreatorEarningsData> {
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
      .select("total_earned, pending_payout, total_paid")
      .eq("creator_id", creatorId)
      .not("ref_code", "is", null);

    const totalEarned = (rows ?? []).reduce((s, r) => s + Number(r.total_earned ?? 0), 0);
    const pending = (rows ?? []).reduce((s, r) => s + Number(r.pending_payout ?? 0), 0);
    const paid = (rows ?? []).reduce((s, r) => s + Number(r.total_paid ?? 0), 0);

    const { data: convs } = await supabase
      .from("conversions")
      .select("id, sale_amount, commission_amount, status, created_at, campaigns(product_name)")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false })
      .limit(50);

    const conversions: EarningRow[] = (convs ?? []).map((c) => {
      const campaign = c.campaigns as { product_name?: string } | null;
      return {
        id: c.id,
        date: fmtDate(c.created_at),
        productName: campaign?.product_name ?? "Sale",
        saleAmount: Number(c.sale_amount ?? 0),
        commission: Number(c.commission_amount ?? 0),
        status: c.status,
      };
    });

    const { data: pays } = await supabase
      .from("payouts")
      .select("id, amount, status, period_start, period_end, paid_at, reference")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false });

    const payouts: PayoutRow[] = (pays ?? []).map((p) => ({
      id: p.id,
      amount: Number(p.amount ?? 0),
      status: p.status,
      period: `${fmtDate(p.period_start)} – ${fmtDate(p.period_end)}`,
      paidAt: p.paid_at,
      reference: p.reference,
    }));

    return { totalEarned, pending, paid, conversions, payouts };
  } catch {
    return EMPTY;
  }
}
