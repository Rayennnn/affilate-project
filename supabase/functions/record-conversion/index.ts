// =============================================================================
// record-conversion  —  POST /functions/v1/record-conversion
// Records a sale attributed to an affiliate ref code.
// Auth: service_role / API key (GTM calls this client-side, so no user auth).
// Body: { ref_code, sale_amount, order_reference?, source? }
//
// The DB trigger computes commission_amount / platform_fee and bumps spent,
// so we only insert the raw conversion here.
// =============================================================================
import { serviceClient } from "../_shared/supabase.ts";
import { ok, fail, handlePreflight } from "../_shared/cors.ts";

// Simple anti-fraud rate limit: max conversions per ref_code per window.
const MAX_PER_WINDOW = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface Body {
  ref_code?: string;
  sale_amount?: number;
  order_reference?: string;
  source?: "gtm" | "sheet" | "manual";
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== "POST") return fail("Method not allowed", 405);

  try {
    let body: Body;
    try {
      body = await req.json();
    } catch {
      return fail("Invalid JSON body", 400);
    }

    const { ref_code, sale_amount, order_reference } = body;
    const source = body.source ?? "manual";

    // ---- Validate -----------------------------------------------------------
    if (!ref_code || typeof ref_code !== "string") {
      return fail("ref_code is required", 400);
    }
    if (typeof sale_amount !== "number" || !isFinite(sale_amount) || sale_amount <= 0) {
      return fail("sale_amount must be a positive number", 400);
    }
    if (!["gtm", "sheet", "manual"].includes(source)) {
      return fail("source must be one of gtm|sheet|manual", 400);
    }

    const supabase = serviceClient();

    // ---- Resolve the affiliate link ----------------------------------------
    const { data: link, error: linkErr } = await supabase
      .from("affiliate_links")
      .select("id, campaign_id, creator_id, campaigns!inner(id, brand_id, status, budget, spent)")
      .eq("ref_code", ref_code)
      .maybeSingle();

    if (linkErr) return fail(`Lookup failed: ${linkErr.message}`, 500);
    if (!link) return fail("Unknown ref_code", 404);

    // deno-lint-ignore no-explicit-any
    const campaign = (link as any).campaigns;

    // ---- Campaign must be active & within budget ---------------------------
    if (campaign.status !== "active") {
      return fail("Campaign is not active", 409);
    }
    if (campaign.budget > 0 && Number(campaign.spent) >= Number(campaign.budget)) {
      return fail("Campaign budget exhausted", 409);
    }

    // ---- Anti-fraud: duplicate order_reference -----------------------------
    if (order_reference) {
      const { data: dup } = await supabase
        .from("conversions")
        .select("id")
        .eq("order_reference", order_reference)
        .maybeSingle();
      if (dup) return fail("Conversion already recorded for this order_reference", 409);
    }

    // ---- Anti-fraud: rate limit per ref_code -------------------------------
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const { count: recentCount } = await supabase
      .from("conversions")
      .select("id", { count: "exact", head: true })
      .eq("affiliate_link_id", link.id)
      .gte("created_at", since);

    if ((recentCount ?? 0) >= MAX_PER_WINDOW) {
      return fail("Rate limit exceeded for this ref_code", 429);
    }

    // ---- Insert (trigger fills commission_amount, platform_fee, spent) -----
    const { data: conversion, error: insErr } = await supabase
      .from("conversions")
      .insert({
        affiliate_link_id: link.id,
        campaign_id: link.campaign_id,
        creator_id: link.creator_id,
        brand_id: campaign.brand_id,
        order_reference: order_reference ?? null,
        sale_amount,
        source,
        status: "pending",
      })
      .select()
      .single();

    if (insErr) {
      // Unique index race on order_reference => treat as duplicate.
      if (insErr.code === "23505") {
        return fail("Conversion already recorded for this order_reference", 409);
      }
      return fail(`Insert failed: ${insErr.message}`, 500);
    }

    return ok(conversion, 201);
  } catch (e) {
    return fail(`Unexpected error: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
});
