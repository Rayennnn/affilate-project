-- =============================================================================
-- 002_create_tables.sql
-- Core tables. All use `create table if not exists` to stay idempotent.
-- UUID PKs, created_at / updated_at defaults of now().
-- =============================================================================

-- Profiles: 1:1 extension of auth.users, carries the role.
create table if not exists profiles (
  id          uuid references auth.users on delete cascade primary key,
  role        user_role not null,
  full_name   text not null,
  email       text not null,
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Brands: e-commerce stores on Converty.
create table if not exists brands (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null unique references profiles(id) on delete cascade,
  store_name      text not null,
  store_url       text not null,            -- Converty storefront URL
  gtm_id          text,                      -- GTM container ID installed on their store
  logo_url        text,
  description     text,
  konnect_deposit numeric not null default 0,-- balance deposited via Konnect
  is_verified     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Creators: UGC creators who promote products.
create table if not exists creators (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null unique references profiles(id) on delete cascade,
  niche         text not null,               -- e.g. "beauty", "tech", "fashion"
  bio           text,
  instagram_url text,
  tiktok_url    text,
  youtube_url   text,
  audience_size integer not null default 0,
  iban          text,                        -- for Konnect payouts
  is_verified   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Campaigns: a product a brand wants promoted.
create table if not exists campaigns (
  id                uuid primary key default gen_random_uuid(),
  brand_id          uuid not null references brands(id) on delete cascade,
  product_name      text not null,
  product_url       text not null,           -- Converty product link
  product_image_url text,
  commission_rate   numeric not null check (commission_rate > 0 and commission_rate <= 100),     -- % paid to creator
  platform_fee_rate numeric not null default 20 check (platform_fee_rate > 0 and platform_fee_rate <= 100), -- % platform takes of the commission
  budget            numeric not null default 0,  -- max campaign budget in DT
  spent             numeric not null default 0,  -- amount consumed so far
  status            campaign_status not null default 'draft',
  starts_at         timestamptz,
  ends_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Matches: a creator applied to / accepted on a campaign.
create table if not exists matches (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  creator_id  uuid not null references creators(id) on delete cascade,
  status      match_status not null default 'pending',
  approved_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (campaign_id, creator_id)           -- one application per creator per campaign
);

-- Affiliate links: generated once a match is approved.
create table if not exists affiliate_links (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid not null unique references matches(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  creator_id  uuid not null references creators(id) on delete cascade,
  ref_code    text not null unique,          -- e.g. "a7c3f9d1"
  full_url    text not null,                 -- product_url + ?ref=ref_code
  clicks      integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Conversions: a tracked sale (GTM, sheet sync, or manual).
create table if not exists conversions (
  id                uuid primary key default gen_random_uuid(),
  affiliate_link_id uuid not null references affiliate_links(id) on delete cascade,
  campaign_id       uuid not null references campaigns(id),
  creator_id        uuid not null references creators(id),
  brand_id          uuid not null references brands(id),
  order_reference   text,                    -- Converty order reference
  sale_amount       numeric not null,        -- sale total
  commission_amount numeric not null default 0, -- creator share (computed by trigger)
  platform_fee      numeric not null default 0, -- platform share (computed by trigger)
  source            conversion_source not null default 'manual',
  status            conversion_status not null default 'pending',
  confirmed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Partial unique index: an order_reference can only convert once (when present).
-- Guards the anti-fraud "no duplicate order" rule at the DB level.
create unique index if not exists uq_conversions_order_reference
  on conversions(order_reference)
  where order_reference is not null;

-- Payouts: money sent to creators for a period.
create table if not exists payouts (
  id            uuid primary key default gen_random_uuid(),
  creator_id    uuid not null references creators(id) on delete cascade,
  amount        numeric not null,
  payout_method text not null default 'konnect',  -- konnect, virement, ...
  status        payout_status not null default 'pending',
  reference     text,                         -- Konnect / wire reference
  period_start  date not null,
  period_end    date not null,
  paid_at       timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Join table: which conversions a payout covers.
create table if not exists payout_conversions (
  payout_id     uuid not null references payouts(id) on delete cascade,
  conversion_id uuid not null references conversions(id) on delete cascade,
  primary key (payout_id, conversion_id)
);

-- Click events: raw click tracking for affiliate links.
create table if not exists click_events (
  id                uuid primary key default gen_random_uuid(),
  affiliate_link_id uuid not null references affiliate_links(id) on delete cascade,
  ip_address        inet,
  user_agent        text,
  referer           text,
  country           text,
  device            text,                     -- mobile, desktop, tablet
  created_at        timestamptz not null default now()
);
