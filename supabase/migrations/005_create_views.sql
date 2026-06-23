-- =============================================================================
-- 005_create_views.sql
-- Convenience views for the frontend.
--
-- security_invoker = on  => the view executes with the *querying user's*
-- privileges, so the RLS policies on the underlying tables still apply.
-- Without this, views run as their owner and would bypass RLS (data leak).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Brand dashboard: one row per (brand, campaign) with rollups.
-- ---------------------------------------------------------------------------
create or replace view brand_dashboard
with (security_invoker = on) as
select
  b.id                                                       as brand_id,
  b.store_name,
  c.id                                                       as campaign_id,
  c.product_name,
  c.status                                                   as campaign_status,
  c.budget,
  c.spent,
  count(distinct m.id) filter (where m.status = 'approved')  as active_creators,
  count(distinct conv.id)                                    as total_conversions,
  coalesce(sum(conv.sale_amount), 0)                         as total_sales,
  coalesce(sum(conv.commission_amount), 0)                   as total_commissions_due
from brands b
left join campaigns c   on c.brand_id = b.id
left join matches m     on m.campaign_id = c.id
left join conversions conv
       on conv.campaign_id = c.id and conv.status <> 'cancelled'
group by b.id, b.store_name, c.id, c.product_name, c.status, c.budget, c.spent;

-- ---------------------------------------------------------------------------
-- Creator dashboard: one row per (creator, affiliate link).
-- ---------------------------------------------------------------------------
create or replace view creator_dashboard
with (security_invoker = on) as
select
  cr.id                                                                          as creator_id,
  cr.profile_id,
  al.ref_code,
  al.full_url,
  al.clicks,
  camp.product_name,
  camp.commission_rate,
  b.store_name                                                                   as brand_name,
  count(conv.id)                                                                 as total_conversions,
  coalesce(sum(conv.sale_amount), 0)                                             as total_sales,
  coalesce(sum(conv.commission_amount), 0)                                       as total_earned,
  coalesce(sum(conv.commission_amount) filter (where conv.status = 'confirmed'), 0) as pending_payout,
  coalesce(sum(conv.commission_amount) filter (where conv.status = 'paid'), 0)   as total_paid
from creators cr
left join affiliate_links al on al.creator_id = cr.id
left join campaigns camp     on camp.id = al.campaign_id
left join brands b           on b.id = camp.brand_id
left join conversions conv   on conv.affiliate_link_id = al.id
group by cr.id, cr.profile_id, al.ref_code, al.full_url, al.clicks,
         camp.product_name, camp.commission_rate, b.store_name;

-- ---------------------------------------------------------------------------
-- Admin overview: single-row platform KPIs.
-- (Only admins can read the underlying tables, so RLS gates this naturally.)
-- ---------------------------------------------------------------------------
create or replace view admin_overview
with (security_invoker = on) as
select
  (select count(*) from brands)                                                      as total_brands,
  (select count(*) from creators)                                                    as total_creators,
  (select count(*) from campaigns where status = 'active')                           as active_campaigns,
  (select count(*) from conversions where status = 'confirmed')                      as pending_conversions,
  (select coalesce(sum(sale_amount), 0) from conversions where status <> 'cancelled')as total_sales_volume,
  (select coalesce(sum(platform_fee), 0) from conversions where status <> 'cancelled')as total_platform_revenue,
  (select coalesce(sum(commission_amount), 0) from conversions where status = 'confirmed') as pending_payouts;
