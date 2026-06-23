-- =============================================================================
-- 003_create_rls_policies.sql
-- Enable RLS on every table and (re)create policies idempotently.
--
-- NOTE ON RECURSION: a policy on `profiles` cannot itself SELECT from
-- `profiles` (it re-triggers RLS -> infinite recursion). We therefore route
-- every role check through SECURITY DEFINER helpers below, which run as the
-- function owner and bypass RLS. This is the standard Supabase pattern.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Role-check helpers (SECURITY DEFINER => bypass RLS, no recursion)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_creator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'creator'
  );
$$;

-- Allow authenticated users to call them.
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.is_creator() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;

-- A user can read their own profile row.
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

-- A user can update their own profile row.
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- A user can insert their own profile (the signup trigger normally does this,
-- but this keeps manual/self-serve inserts working).
drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Admins can read every profile.
drop policy if exists "Admin can view all profiles" on profiles;
create policy "Admin can view all profiles"
  on profiles for select using (public.is_admin());

-- Admins can update/delete any profile.
drop policy if exists "Admin can manage all profiles" on profiles;
create policy "Admin can manage all profiles"
  on profiles for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- BRANDS
-- ---------------------------------------------------------------------------
alter table brands enable row level security;

-- The owning brand can do anything with its own row (USING also acts as
-- WITH CHECK for inserts/updates since WITH CHECK is omitted).
drop policy if exists "Brand owner can manage" on brands;
create policy "Brand owner can manage"
  on brands for all using (profile_id = auth.uid());

-- Creators can browse all brands.
drop policy if exists "Creators can view brands" on brands;
create policy "Creators can view brands"
  on brands for select using (public.is_creator());

-- Admins: full access.
drop policy if exists "Admin full access brands" on brands;
create policy "Admin full access brands"
  on brands for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- CREATORS  (omitted in the original spec — added here for completeness)
-- ---------------------------------------------------------------------------
alter table creators enable row level security;

-- The owning creator can manage their own row.
drop policy if exists "Creator owner can manage" on creators;
create policy "Creator owner can manage"
  on creators for all using (profile_id = auth.uid());

-- Brands can browse creators (to discover who to match with).
drop policy if exists "Brands can view creators" on creators;
create policy "Brands can view creators"
  on creators for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'brand')
  );

-- Admins: full access.
drop policy if exists "Admin full access creators" on creators;
create policy "Admin full access creators"
  on creators for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- CAMPAIGNS
-- ---------------------------------------------------------------------------
alter table campaigns enable row level security;

-- A brand fully manages campaigns it owns.
drop policy if exists "Brand manages own campaigns" on campaigns;
create policy "Brand manages own campaigns"
  on campaigns for all using (
    brand_id in (select id from brands where profile_id = auth.uid())
  ) with check (
    brand_id in (select id from brands where profile_id = auth.uid())
  );

-- Creators can see only active campaigns (the marketplace browse view).
drop policy if exists "Creators view active campaigns" on campaigns;
create policy "Creators view active campaigns"
  on campaigns for select using (status = 'active' and public.is_creator());

-- Admins: full access.
drop policy if exists "Admin full access campaigns" on campaigns;
create policy "Admin full access campaigns"
  on campaigns for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- MATCHES
-- ---------------------------------------------------------------------------
alter table matches enable row level security;

-- A creator manages their own match applications.
drop policy if exists "Creator manages own matches" on matches;
create policy "Creator manages own matches"
  on matches for all using (
    creator_id in (select id from creators where profile_id = auth.uid())
  ) with check (
    creator_id in (select id from creators where profile_id = auth.uid())
  );

-- A brand can view (and approve/reject via update) matches on its campaigns.
drop policy if exists "Brand views matches on own campaigns" on matches;
create policy "Brand views matches on own campaigns"
  on matches for select using (
    campaign_id in (
      select c.id from campaigns c
      join brands b on b.id = c.brand_id
      where b.profile_id = auth.uid()
    )
  );

-- A brand can update the status of matches on its own campaigns.
drop policy if exists "Brand updates matches on own campaigns" on matches;
create policy "Brand updates matches on own campaigns"
  on matches for update using (
    campaign_id in (
      select c.id from campaigns c
      join brands b on b.id = c.brand_id
      where b.profile_id = auth.uid()
    )
  );

-- Admins: full access.
drop policy if exists "Admin full access matches" on matches;
create policy "Admin full access matches"
  on matches for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- AFFILIATE LINKS  (created by a SECURITY DEFINER trigger; users only read)
-- ---------------------------------------------------------------------------
alter table affiliate_links enable row level security;

-- Creator reads their own links.
drop policy if exists "Creator views own links" on affiliate_links;
create policy "Creator views own links"
  on affiliate_links for select using (
    creator_id in (select id from creators where profile_id = auth.uid())
  );

-- Brand reads links generated on its campaigns.
drop policy if exists "Brand views links on own campaigns" on affiliate_links;
create policy "Brand views links on own campaigns"
  on affiliate_links for select using (
    campaign_id in (
      select c.id from campaigns c
      join brands b on b.id = c.brand_id
      where b.profile_id = auth.uid()
    )
  );

-- Admins: full access.
drop policy if exists "Admin full access links" on affiliate_links;
create policy "Admin full access links"
  on affiliate_links for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- CONVERSIONS  (written by edge functions via service_role; users only read)
-- ---------------------------------------------------------------------------
alter table conversions enable row level security;

-- Creator reads their own conversions.
drop policy if exists "Creator views own conversions" on conversions;
create policy "Creator views own conversions"
  on conversions for select using (
    creator_id in (select id from creators where profile_id = auth.uid())
  );

-- Brand reads conversions attributed to it.
drop policy if exists "Brand views own conversions" on conversions;
create policy "Brand views own conversions"
  on conversions for select using (
    brand_id in (select id from brands where profile_id = auth.uid())
  );

-- Admins: full access.
drop policy if exists "Admin full access conversions" on conversions;
create policy "Admin full access conversions"
  on conversions for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- PAYOUTS
-- ---------------------------------------------------------------------------
alter table payouts enable row level security;

-- Creator reads their own payouts.
drop policy if exists "Creator views own payouts" on payouts;
create policy "Creator views own payouts"
  on payouts for select using (
    creator_id in (select id from creators where profile_id = auth.uid())
  );

-- Admins: full access.
drop policy if exists "Admin full access payouts" on payouts;
create policy "Admin full access payouts"
  on payouts for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- PAYOUT_CONVERSIONS  (omitted in the original spec — added here)
-- ---------------------------------------------------------------------------
alter table payout_conversions enable row level security;

-- Creator can read the join rows tied to their own payouts.
drop policy if exists "Creator views own payout_conversions" on payout_conversions;
create policy "Creator views own payout_conversions"
  on payout_conversions for select using (
    payout_id in (
      select p.id from payouts p
      join creators c on c.id = p.creator_id
      where c.profile_id = auth.uid()
    )
  );

-- Admins: full access.
drop policy if exists "Admin full access payout_conversions" on payout_conversions;
create policy "Admin full access payout_conversions"
  on payout_conversions for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- CLICK EVENTS  (public insert for tracking; admins read)
-- ---------------------------------------------------------------------------
alter table click_events enable row level security;

-- Anyone (including anon) can insert a click event.
drop policy if exists "Public can insert clicks" on click_events;
create policy "Public can insert clicks"
  on click_events for insert with check (true);

-- Only admins can read raw click events.
drop policy if exists "Admin can view clicks" on click_events;
create policy "Admin can view clicks"
  on click_events for select using (public.is_admin());
