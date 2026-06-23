// =============================================================================
// create-payout  —  POST /functions/v1/create-payout
// Creates a payout, links the given conversions, and marks them as paid.
// Auth: admin only.
// Body: { creator_id, conversion_ids[], amount, reference? }
// =============================================================================
import { serviceClient, requireAdmin } from "../_shared/supabase.ts";
import { ok, fail, handlePreflight } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return fail("Method not allowed", 405);

  const auth = await requireAdmin(req);
  if (!auth.ok) return fail(auth.error, auth.status);

  try {
    const body = await req.json().catch(() => ({}));
    const { creator_id, conversion_ids, amount, reference } = body;

    if (!creator_id) return fail("creator_id is required", 400);
    if (!Array.isArray(conversion_ids) || conversion_ids.length === 0) {
      return fail("conversion_ids must be a non-empty array", 400);
    }
    if (typeof amount !== "number" || !isFinite(amount) || amount <= 0) {
      return fail("amount must be a positive number", 400);
    }

    const supabase = serviceClient();

    // Validate the conversions: must exist, belong to this creator, be
    // confirmed, and not already attached to another payout.
    const { data: convs, error: convErr } = await supabase
      .from("conversions")
      .select("id, creator_id, status, confirmed_at, created_at")
      .in("id", conversion_ids);
    if (convErr) return fail(`Lookup failed: ${convErr.message}`, 500);

    if (!convs || convs.length !== conversion_ids.length) {
      return fail("One or more conversion_ids do not exist", 404);
    }
    const wrongOwner = convs.find((c) => c.creator_id !== creator_id);
    if (wrongOwner) return fail("Conversion does not belong to this creator", 422);

    // Already paid? Check this BEFORE the confirmed-status check, since a paid
    // conversion is no longer 'confirmed' and we want the clearer 409.
    const { data: existingLinks } = await supabase
      .from("payout_conversions")
      .select("conversion_id")
      .in("conversion_id", conversion_ids);
    const alreadyPaid = (existingLinks && existingLinks.length > 0) ||
      convs.some((c) => c.status === "paid");
    if (alreadyPaid) {
      return fail("One or more conversions are already paid out", 409);
    }

    const notConfirmed = convs.find((c) => c.status !== "confirmed");
    if (notConfirmed) return fail(`Conversion ${notConfirmed.id} is not confirmed`, 422);

    // Derive the covered period from the conversions.
    const dates = convs.map((c) => new Date(c.confirmed_at ?? c.created_at).getTime());
    const periodStart = new Date(Math.min(...dates)).toISOString().slice(0, 10);
    const periodEnd = new Date(Math.max(...dates)).toISOString().slice(0, 10);

    // 1) Create the payout.
    const { data: payout, error: payErr } = await supabase
      .from("payouts")
      .insert({
        creator_id,
        amount,
        reference: reference ?? null,
        status: "processing",
        period_start: periodStart,
        period_end: periodEnd,
      })
      .select()
      .single();
    if (payErr) return fail(`Payout insert failed: ${payErr.message}`, 500);

    // 2) Link the conversions.
    const links = conversion_ids.map((id: string) => ({
      payout_id: payout.id,
      conversion_id: id,
    }));
    const { error: linkErr } = await supabase.from("payout_conversions").insert(links);
    if (linkErr) {
      // Roll back the payout so we don't leave an orphan.
      await supabase.from("payouts").delete().eq("id", payout.id);
      return fail(`Linking conversions failed: ${linkErr.message}`, 500);
    }

    // 3) Mark conversions as paid.
    const { error: updErr } = await supabase
      .from("conversions")
      .update({ status: "paid" })
      .in("id", conversion_ids);
    if (updErr) return fail(`Marking conversions paid failed: ${updErr.message}`, 500);

    return ok(payout, 201);
  } catch (e) {
    return fail(`Unexpected error: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
});
