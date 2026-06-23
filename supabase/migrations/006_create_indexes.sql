-- =============================================================================
-- 006_create_indexes.sql
-- Performance indexes. All use `if not exists` for idempotency.
-- =============================================================================

create index if not exists idx_affiliate_links_ref_code   on affiliate_links(ref_code);
create index if not exists idx_affiliate_links_creator     on affiliate_links(creator_id);
create index if not exists idx_affiliate_links_campaign    on affiliate_links(campaign_id);

create index if not exists idx_conversions_affiliate_link  on conversions(affiliate_link_id);
create index if not exists idx_conversions_campaign        on conversions(campaign_id);
create index if not exists idx_conversions_creator         on conversions(creator_id);
create index if not exists idx_conversions_brand           on conversions(brand_id);
create index if not exists idx_conversions_status          on conversions(status);
create index if not exists idx_conversions_created         on conversions(created_at);

create index if not exists idx_matches_campaign            on matches(campaign_id);
create index if not exists idx_matches_creator             on matches(creator_id);
create index if not exists idx_matches_status              on matches(status);

create index if not exists idx_campaigns_brand             on campaigns(brand_id);
create index if not exists idx_campaigns_status            on campaigns(status);

create index if not exists idx_click_events_link           on click_events(affiliate_link_id);
create index if not exists idx_click_events_created        on click_events(created_at);

create index if not exists idx_payouts_creator             on payouts(creator_id);
create index if not exists idx_payout_conversions_conv     on payout_conversions(conversion_id);
