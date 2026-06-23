// DB triggers & constraints: signup->profile, match-approval->affiliate link,
// commission/fee computation + spent bump, timestamp stamping, dup-order guard.
import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { admin, createUser, deleteUser, uniq } from "./helpers.mjs";

const a = admin();
const userIds = [];

let brand, creator;            // auth users
let brandRow, creatorRow;      // brands/creators rows
let campaign, match, link;     // campaign, approved match, generated link

describe("DB triggers & constraints", () => {
  before(async () => {
    brand = await createUser({ role: "brand", full_name: "Trigger Brand" });
    creator = await createUser({ role: "creator", full_name: "Trigger Creator" });
    userIds.push(brand.id, creator.id);
  });

  after(async () => {
    for (const id of userIds) await deleteUser(id);
  });

  test("handle_new_user creates a profile with the role from metadata", async () => {
    const { data, error } = await a
      .from("profiles").select("role, full_name, email").eq("id", brand.id).single();
    assert.equal(error, null);
    assert.equal(data.role, "brand");
    assert.equal(data.full_name, "Trigger Brand");
  });

  test("approving a match auto-generates a unique affiliate link", async () => {
    brandRow = (await a.from("brands").insert({
      profile_id: brand.id, store_name: "Store " + uniq(),
      store_url: "https://shop.converty.shop",
    }).select().single()).data;

    creatorRow = (await a.from("creators").insert({
      profile_id: creator.id, niche: "tech",
    }).select().single()).data;

    campaign = (await a.from("campaigns").insert({
      brand_id: brandRow.id, product_name: "Widget",
      product_url: "https://shop.converty.shop/p/widget",
      commission_rate: 20, platform_fee_rate: 25, budget: 100000, status: "active",
    }).select().single()).data;

    match = (await a.from("matches").insert({
      campaign_id: campaign.id, creator_id: creatorRow.id, status: "approved",
    }).select().single()).data;

    assert.ok(match.approved_at, "approved_at should be stamped on approval");

    const { data: links } = await a.from("affiliate_links").select("*").eq("match_id", match.id);
    assert.equal(links.length, 1, "exactly one affiliate link should be created");
    link = links[0];
    assert.match(link.ref_code, /^[a-z0-9]{8}$/, "ref_code is 8 lowercase hex chars");
    assert.ok(
      link.full_url.includes(`?ref=${link.ref_code}`) || link.full_url.includes(`&ref=${link.ref_code}`),
      "full_url should carry the ref code",
    );
  });

  test("re-approving the same match does not create a second link", async () => {
    await a.from("matches").update({ status: "pending" }).eq("id", match.id);
    await a.from("matches").update({ status: "approved" }).eq("id", match.id);
    const { data: links } = await a.from("affiliate_links").select("id").eq("match_id", match.id);
    assert.equal(links.length, 1, "trigger must be idempotent per match");
  });

  test("conversion insert computes commission + platform_fee and bumps spent", async () => {
    const before = Number(
      (await a.from("campaigns").select("spent").eq("id", campaign.id).single()).data.spent,
    );

    const conv = (await a.from("conversions").insert({
      affiliate_link_id: link.id, campaign_id: campaign.id,
      creator_id: creatorRow.id, brand_id: brandRow.id,
      order_reference: "T-" + uniq(), sale_amount: 100,
    }).select().single()).data;

    // commission = 100 * 20% = 20 ; platform_fee = 20 * 25% = 5
    assert.equal(Number(conv.commission_amount), 20);
    assert.equal(Number(conv.platform_fee), 5);

    const after = Number(
      (await a.from("campaigns").select("spent").eq("id", campaign.id).single()).data.spent,
    );
    assert.equal(after - before, 25, "spent should grow by commission + fee");
  });

  test("confirming a conversion stamps confirmed_at", async () => {
    const conv = (await a.from("conversions").insert({
      affiliate_link_id: link.id, campaign_id: campaign.id,
      creator_id: creatorRow.id, brand_id: brandRow.id,
      order_reference: "T-" + uniq(), sale_amount: 50,
    }).select().single()).data;
    assert.equal(conv.confirmed_at, null);

    const upd = (await a.from("conversions")
      .update({ status: "confirmed" }).eq("id", conv.id).select().single()).data;
    assert.ok(upd.confirmed_at, "confirmed_at should be set on transition to confirmed");
  });

  test("duplicate order_reference is rejected by the partial unique index", async () => {
    const ref = "DUP-" + uniq();
    const base = {
      affiliate_link_id: link.id, campaign_id: campaign.id,
      creator_id: creatorRow.id, brand_id: brandRow.id, sale_amount: 10,
    };
    const first = await a.from("conversions").insert({ ...base, order_reference: ref });
    assert.equal(first.error, null);

    const second = await a.from("conversions").insert({ ...base, order_reference: ref });
    assert.ok(second.error, "second insert with same order_reference must fail");
    assert.equal(second.error.code, "23505");
  });

  test("two conversions with NULL order_reference are both allowed", async () => {
    const base = {
      affiliate_link_id: link.id, campaign_id: campaign.id,
      creator_id: creatorRow.id, brand_id: brandRow.id, sale_amount: 10,
      order_reference: null,
    };
    const r1 = await a.from("conversions").insert(base);
    const r2 = await a.from("conversions").insert(base);
    assert.equal(r1.error, null);
    assert.equal(r2.error, null, "partial index must not block multiple NULLs");
  });
});
