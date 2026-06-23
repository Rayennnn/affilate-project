// Row Level Security: a creator may only see their own data; cross-tenant reads
// return nothing; anon is fully locked out; creators only browse active campaigns.
import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { admin, anon, createUser, deleteUser, clientFor, uniq } from "./helpers.mjs";

const a = admin();
const userIds = [];

let brand, creator1, creator2;
let brandRow, c1Row, c2Row;
let activeCampaign, draftCampaign;

async function seedConversionFor(creatorRow) {
  const m = (await a.from("matches").insert({
    campaign_id: activeCampaign.id, creator_id: creatorRow.id, status: "approved",
  }).select().single()).data;
  const link = (await a.from("affiliate_links").select("*").eq("match_id", m.id).single()).data;
  await a.from("conversions").insert({
    affiliate_link_id: link.id, campaign_id: activeCampaign.id,
    creator_id: creatorRow.id, brand_id: brandRow.id,
    order_reference: "RLS-" + uniq(), sale_amount: 100, status: "confirmed",
  });
}

describe("Row Level Security", () => {
  before(async () => {
    brand = await createUser({ role: "brand", full_name: "RLS Brand" });
    creator1 = await createUser({ role: "creator", full_name: "RLS Creator 1" });
    creator2 = await createUser({ role: "creator", full_name: "RLS Creator 2" });
    userIds.push(brand.id, creator1.id, creator2.id);

    brandRow = (await a.from("brands").insert({
      profile_id: brand.id, store_name: "RLSStore " + uniq(),
      store_url: "https://rls.converty.shop",
    }).select().single()).data;
    c1Row = (await a.from("creators").insert({ profile_id: creator1.id, niche: "beauty" }).select().single()).data;
    c2Row = (await a.from("creators").insert({ profile_id: creator2.id, niche: "tech" }).select().single()).data;

    activeCampaign = (await a.from("campaigns").insert({
      brand_id: brandRow.id, product_name: "Active",
      product_url: "https://rls.converty.shop/p/active",
      commission_rate: 20, budget: 100000, status: "active",
    }).select().single()).data;
    draftCampaign = (await a.from("campaigns").insert({
      brand_id: brandRow.id, product_name: "Draft",
      product_url: "https://rls.converty.shop/p/draft",
      commission_rate: 20, budget: 100000, status: "draft",
    }).select().single()).data;

    await seedConversionFor(c1Row);
    await seedConversionFor(c2Row);
  });

  after(async () => {
    for (const id of userIds) await deleteUser(id);
  });

  test("creator sees only their own conversions", async () => {
    const c1 = await clientFor(creator1.email, creator1.password);
    const { data, error } = await c1.from("conversions").select("id, creator_id");
    assert.equal(error, null);
    assert.ok(data.length >= 1, "creator1 should see their own conversion");
    assert.ok(data.every((r) => r.creator_id === c1Row.id), "no foreign conversions leak");
  });

  test("creator cannot read another creator's conversions", async () => {
    const c1 = await clientFor(creator1.email, creator1.password);
    const { data } = await c1.from("conversions").select("id").eq("creator_id", c2Row.id);
    assert.equal(data.length, 0, "cross-creator read must return nothing");
  });

  test("creator only browses ACTIVE campaigns", async () => {
    const c1 = await clientFor(creator1.email, creator1.password);
    const { data } = await c1.from("campaigns").select("id, status");
    assert.ok(data.every((r) => r.status === "active"), "only active campaigns visible");
    assert.ok(!data.find((r) => r.id === draftCampaign.id), "draft campaign must be hidden");
    assert.ok(data.find((r) => r.id === activeCampaign.id), "active campaign should be visible");
  });

  test("creator reads only their own profile", async () => {
    const c1 = await clientFor(creator1.email, creator1.password);
    const { data } = await c1.from("profiles").select("id");
    assert.ok(data.every((r) => r.id === creator1.id), "profiles is self-only for creators");
  });

  test("creator sees only their own creator row", async () => {
    const c1 = await clientFor(creator1.email, creator1.password);
    const { data } = await c1.from("creators").select("id");
    assert.ok(data.every((r) => r.id === c1Row.id));
  });

  test("anonymous users cannot read conversions at all", async () => {
    const c = anon();
    const { data } = await c.from("conversions").select("id");
    assert.equal((data ?? []).length, 0, "anon is locked out of conversions");
  });

  test("brand reads its own conversions but not those of other brands", async () => {
    const bc = await clientFor(brand.email, brand.password);
    const { data } = await bc.from("conversions").select("id, brand_id");
    assert.ok(data.every((r) => r.brand_id === brandRow.id), "brand sees only its own conversions");
  });
});
