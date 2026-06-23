// Edge functions over HTTP against the deployed project:
// track-click, record-conversion (+ anti-fraud), generate-payout-report, create-payout.
import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import {
  admin, createUser, deleteUser, uniq, fnFetch, pollUntil, SERVICE_KEY,
} from "./helpers.mjs";

const a = admin();
const userIds = [];

let brand, creator, creator2;
let brandRow, creatorRow, creator2Row;
let campaign, link, rateLink;

describe("Edge functions", () => {
  before(async () => {
    brand = await createUser({ role: "brand", full_name: "Fn Brand" });
    creator = await createUser({ role: "creator", full_name: "Fn Creator" });
    creator2 = await createUser({ role: "creator", full_name: "Fn Creator 2" });
    userIds.push(brand.id, creator.id, creator2.id);

    brandRow = (await a.from("brands").insert({
      profile_id: brand.id, store_name: "FnStore " + uniq(),
      store_url: "https://fn.converty.shop",
    }).select().single()).data;

    creatorRow = (await a.from("creators").insert({
      profile_id: creator.id, niche: "beauty", iban: "TN59" + uniq(),
    }).select().single()).data;
    creator2Row = (await a.from("creators").insert({
      profile_id: creator2.id, niche: "tech",
    }).select().single()).data;

    campaign = (await a.from("campaigns").insert({
      brand_id: brandRow.id, product_name: "Serum",
      product_url: "https://fn.converty.shop/p/serum",
      commission_rate: 20, platform_fee_rate: 25, budget: 100000, status: "active",
    }).select().single()).data;

    // Primary link (general tests) + a dedicated link for the rate-limit test
    // so its hourly counter is not polluted by the other tests.
    const m1 = (await a.from("matches").insert({
      campaign_id: campaign.id, creator_id: creatorRow.id, status: "approved",
    }).select().single()).data;
    const m2 = (await a.from("matches").insert({
      campaign_id: campaign.id, creator_id: creator2Row.id, status: "approved",
    }).select().single()).data;

    link = (await a.from("affiliate_links").select("*").eq("match_id", m1.id).single()).data;
    rateLink = (await a.from("affiliate_links").select("*").eq("match_id", m2.id).single()).data;
  });

  after(async () => {
    for (const id of userIds) await deleteUser(id);
  });

  // ---- track-click ---------------------------------------------------------
  test("track-click with unknown ref 302-redirects to the landing page", async () => {
    const r = await fnFetch(`track-click?ref=nope${uniq()}`, { method: "GET" });
    assert.equal(r.status, 302);
    assert.ok(r.location, "should have a Location header");
  });

  test("track-click with a real ref redirects to full_url and logs a click", async () => {
    const before = Number(
      (await a.from("affiliate_links").select("clicks").eq("id", link.id).single()).data.clicks,
    );

    const r = await fnFetch(`track-click?ref=${link.ref_code}`, { method: "GET" });
    assert.equal(r.status, 302);
    assert.equal(r.location, link.full_url);

    // click insert + counter bump happen in the background (waitUntil) -> poll.
    const clicks = await pollUntil(
      async () => Number(
        (await a.from("affiliate_links").select("clicks").eq("id", link.id).single()).data.clicks,
      ),
      (c) => c > before,
    );
    assert.ok(clicks > before, "clicks counter should increment");

    const { data: events } = await a.from("click_events")
      .select("id").eq("affiliate_link_id", link.id);
    assert.ok(events.length >= 1, "a click_event row should be recorded");
  });

  // ---- record-conversion ---------------------------------------------------
  test("record-conversion creates a conversion with computed amounts", async () => {
    const r = await fnFetch("record-conversion", {
      body: { ref_code: link.ref_code, sale_amount: 200, order_reference: "FN-" + uniq(), source: "gtm" },
    });
    assert.equal(r.status, 201);
    assert.equal(r.json.success, true);
    assert.equal(Number(r.json.data.commission_amount), 40); // 200 * 20%
    assert.equal(Number(r.json.data.platform_fee), 10);      // 40 * 25%
  });

  test("record-conversion rejects a duplicate order_reference (409)", async () => {
    const ref = "FN-DUP-" + uniq();
    const ok = await fnFetch("record-conversion", { body: { ref_code: link.ref_code, sale_amount: 50, order_reference: ref } });
    assert.equal(ok.status, 201);
    const dup = await fnFetch("record-conversion", { body: { ref_code: link.ref_code, sale_amount: 50, order_reference: ref } });
    assert.equal(dup.status, 409);
    assert.equal(dup.json.success, false);
  });

  test("record-conversion rejects unknown ref_code (404)", async () => {
    const r = await fnFetch("record-conversion", { body: { ref_code: "doesnotexist", sale_amount: 50 } });
    assert.equal(r.status, 404);
  });

  test("record-conversion validates the body (400)", async () => {
    const noRef = await fnFetch("record-conversion", { body: { sale_amount: 50 } });
    assert.equal(noRef.status, 400);
    const badAmount = await fnFetch("record-conversion", { body: { ref_code: link.ref_code, sale_amount: -5 } });
    assert.equal(badAmount.status, 400);
  });

  test("record-conversion enforces the 10/hour rate limit (429)", async () => {
    for (let i = 0; i < 10; i++) {
      const r = await fnFetch("record-conversion", {
        body: { ref_code: rateLink.ref_code, sale_amount: 5, order_reference: `RL-${i}-${uniq()}` },
      });
      assert.equal(r.status, 201, `call ${i + 1} should succeed`);
    }
    const limited = await fnFetch("record-conversion", {
      body: { ref_code: rateLink.ref_code, sale_amount: 5, order_reference: `RL-over-${uniq()}` },
    });
    assert.equal(limited.status, 429, "11th call within the hour should be rate-limited");
  });

  // ---- payout report + payout creation -------------------------------------
  test("generate-payout-report aggregates confirmed unpaid conversions by creator", async () => {
    // Make a confirmed conversion for `creator`.
    const conv = (await a.from("conversions").insert({
      affiliate_link_id: link.id, campaign_id: campaign.id,
      creator_id: creatorRow.id, brand_id: brandRow.id,
      order_reference: "PR-" + uniq(), sale_amount: 100, status: "confirmed",
    }).select().single()).data;

    const today = new Date();
    const start = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);
    const end = today.toISOString().slice(0, 10);

    const r = await fnFetch("generate-payout-report", {
      token: SERVICE_KEY, body: { period_start: start, period_end: end },
    });
    assert.equal(r.status, 200);
    assert.equal(r.json.success, true);
    const row = r.json.data.find((x) => x.creator_id === creatorRow.id);
    assert.ok(row, "our creator should appear in the report");
    assert.ok(row.conversion_ids.includes(conv.id));
    assert.ok(row.total_commission > 0);
  });

  test("generate-payout-report requires admin/service auth (401/403)", async () => {
    const r = await fnFetch("generate-payout-report", { body: { period_start: "2026-01-01", period_end: "2026-12-31" } });
    assert.ok([401, 403].includes(r.status), `expected 401/403, got ${r.status}`);
  });

  test("create-payout links conversions and marks them paid", async () => {
    const conv = (await a.from("conversions").insert({
      affiliate_link_id: link.id, campaign_id: campaign.id,
      creator_id: creatorRow.id, brand_id: brandRow.id,
      order_reference: "PAY-" + uniq(), sale_amount: 100, status: "confirmed",
    }).select().single()).data;

    const r = await fnFetch("create-payout", {
      token: SERVICE_KEY,
      body: { creator_id: creatorRow.id, conversion_ids: [conv.id], amount: 20, reference: "KONNECT-" + uniq() },
    });
    assert.equal(r.status, 201);
    assert.equal(r.json.success, true);
    const payoutId = r.json.data.id;

    const paid = (await a.from("conversions").select("status").eq("id", conv.id).single()).data;
    assert.equal(paid.status, "paid", "conversion should be marked paid");

    const { data: links } = await a.from("payout_conversions")
      .select("conversion_id").eq("payout_id", payoutId);
    assert.ok(links.some((l) => l.conversion_id === conv.id), "join row should exist");
  });

  test("create-payout refuses an already-paid conversion (409)", async () => {
    const conv = (await a.from("conversions").insert({
      affiliate_link_id: link.id, campaign_id: campaign.id,
      creator_id: creatorRow.id, brand_id: brandRow.id,
      order_reference: "PAY2-" + uniq(), sale_amount: 100, status: "confirmed",
    }).select().single()).data;

    const first = await fnFetch("create-payout", {
      token: SERVICE_KEY, body: { creator_id: creatorRow.id, conversion_ids: [conv.id], amount: 20 },
    });
    assert.equal(first.status, 201);

    const second = await fnFetch("create-payout", {
      token: SERVICE_KEY, body: { creator_id: creatorRow.id, conversion_ids: [conv.id], amount: 20 },
    });
    assert.equal(second.status, 409, "cannot pay the same conversion twice");
  });
});
