// =============================================================================
// generate-payout-report  —  POST /functions/v1/generate-payout-report
// Aggregates confirmed, not-yet-paid conversions in a period, grouped by creator.
// Auth: admin only.
// Body: { period_start (ISO date), period_end (ISO date) }
// =============================================================================
import { serviceClient, requireAdmin } from "../_shared/supabase.ts";
import { ok, fail, handlePreflight } from "../_shared/cors.ts";

interface CreatorRow {
  creator_id: string;
  creator_name: string;
  iban: string | null;
  total_sales: number;
  total_commission: number;
  platform_fee: number;
  conversion_count: number;
  conversion_ids: string[];
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return fail("Method not allowed", 405);

  const auth = await requireAdmin(req);
  if (!auth.ok) return fail(auth.error, auth.status);

  try {
    const { period_start, period_end } = await req.json().catch(() => ({}));
    if (!period_start || !period_end) {
      return fail("period_start and period_end are required", 400);
    }
    // Make period_end inclusive of the whole day.
    const startISO = new Date(period_start).toISOString();
    const endISO = new Date(`${period_end}T23:59:59.999Z`).toISOString();

    const supabase = serviceClient();

    // Conversion ids already attached to a payout (exclude them).
    const { data: paidLinks, error: plErr } = await supabase
      .from("payout_conversions")
      .select("conversion_id");
    if (plErr) return fail(`Lookup failed: ${plErr.message}`, 500);
    const alreadyPaid = new Set((paidLinks ?? []).map((p) => p.conversion_id));

    // Confirmed conversions in the period, with creator + payout info.
    const { data: conversions, error: convErr } = await supabase
      .from("conversions")
      .select(
        "id, creator_id, sale_amount, commission_amount, platform_fee, " +
          "creators!inner(id, iban, profiles!inner(full_name))",
      )
      .eq("status", "confirmed")
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    if (convErr) return fail(`Query failed: ${convErr.message}`, 500);

    const byCreator = new Map<string, CreatorRow>();

    for (const c of conversions ?? []) {
      if (alreadyPaid.has(c.id)) continue;
      // deno-lint-ignore no-explicit-any
      const creator = (c as any).creators;
      const name = creator?.profiles?.full_name ?? "";

      let row = byCreator.get(c.creator_id);
      if (!row) {
        row = {
          creator_id: c.creator_id,
          creator_name: name,
          iban: creator?.iban ?? null,
          total_sales: 0,
          total_commission: 0,
          platform_fee: 0,
          conversion_count: 0,
          conversion_ids: [],
        };
        byCreator.set(c.creator_id, row);
      }
      row.total_sales += Number(c.sale_amount);
      row.total_commission += Number(c.commission_amount);
      row.platform_fee += Number(c.platform_fee);
      row.conversion_count += 1;
      row.conversion_ids.push(c.id);
    }

    // Round money fields to 2 decimals.
    const report = [...byCreator.values()].map((r) => ({
      ...r,
      total_sales: Math.round(r.total_sales * 100) / 100,
      total_commission: Math.round(r.total_commission * 100) / 100,
      platform_fee: Math.round(r.platform_fee * 100) / 100,
    }));

    return ok(report);
  } catch (e) {
    return fail(`Unexpected error: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
});
