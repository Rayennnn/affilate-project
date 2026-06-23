-- =============================================================================
-- 004_create_functions_triggers.sql
-- Database functions + triggers.
-- All functions use `create or replace`; all triggers use
-- `create or replace trigger` (PG14+) so the migration is idempotent.
-- SECURITY DEFINER functions pin search_path to public for safety.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Auto-create a profile row right after a new auth.users row is inserted.
-- Role + full_name are read from the signup metadata; defaults to 'creator'.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'creator')::user_role,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Generate a unique 8-char ref code (retry until unique).
-- ---------------------------------------------------------------------------
create or replace function public.generate_ref_code()
returns text
language plpgsql
as $$
declare
  code text;
  exists_already boolean;
begin
  loop
    code := lower(substr(md5(random()::text), 1, 8));
    select exists(select 1 from affiliate_links where ref_code = code) into exists_already;
    exit when not exists_already;
  end loop;
  return code;
end;
$$;

-- ---------------------------------------------------------------------------
-- Atomic click counter bump for affiliate_links (called by track-click).
-- SECURITY DEFINER so the public/anon caller can increment without a SELECT/
-- UPDATE policy on affiliate_links.
-- ---------------------------------------------------------------------------
create or replace function public.increment_link_clicks(p_link_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update affiliate_links set clicks = clicks + 1 where id = p_link_id;
$$;

grant execute on function public.increment_link_clicks(uuid) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Stamp approved_at when a match transitions into 'approved'.
-- BEFORE trigger so it can mutate NEW.
-- ---------------------------------------------------------------------------
create or replace function public.set_match_approved_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'approved' and (tg_op = 'INSERT' or old.status is distinct from 'approved') then
    new.approved_at := coalesce(new.approved_at, now());
  end if;
  return new;
end;
$$;

create or replace trigger before_match_set_approved_at
  before insert or update on matches
  for each row execute function public.set_match_approved_at();

-- ---------------------------------------------------------------------------
-- Create the affiliate link when a match becomes 'approved'.
-- AFTER trigger (the row must exist before we FK-reference it).
-- Handles both INSERT (status already approved) and UPDATE (status changed).
-- ---------------------------------------------------------------------------
create or replace function public.create_affiliate_link_on_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  campaign_record record;
  new_ref_code text;
begin
  if new.status = 'approved' and (tg_op = 'INSERT' or old.status is distinct from 'approved') then
    -- Skip if a link already exists for this match (idempotent / re-approval safe).
    if exists (select 1 from affiliate_links where match_id = new.id) then
      return new;
    end if;

    select * into campaign_record from campaigns where id = new.campaign_id;
    new_ref_code := public.generate_ref_code();

    insert into affiliate_links (match_id, campaign_id, creator_id, ref_code, full_url)
    values (
      new.id,
      new.campaign_id,
      new.creator_id,
      new_ref_code,
      campaign_record.product_url
        || case when campaign_record.product_url like '%?%' then '&' else '?' end
        || 'ref=' || new_ref_code
    );
  end if;
  return new;
end;
$$;

create or replace trigger on_match_approved
  after update on matches
  for each row execute function public.create_affiliate_link_on_approval();

create or replace trigger on_match_insert_approved
  after insert on matches
  for each row execute function public.create_affiliate_link_on_approval();

-- ---------------------------------------------------------------------------
-- Compute commission + platform fee on conversion insert, and bump the
-- campaign's spent counter. BEFORE insert so it can set NEW columns.
-- platform_fee is taken OUT OF the commission (creator nets commission - fee?).
-- Per spec: commission = sale * commission_rate%; platform_fee = commission *
-- platform_fee_rate%. We add both to `spent` (total cost charged to budget).
-- ---------------------------------------------------------------------------
create or replace function public.calculate_conversion_amounts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  campaign_record record;
begin
  select * into campaign_record from campaigns where id = new.campaign_id;
  if campaign_record is null then
    raise exception 'Campaign % not found for conversion', new.campaign_id;
  end if;

  new.commission_amount := round((new.sale_amount * campaign_record.commission_rate / 100)::numeric, 2);
  new.platform_fee      := round((new.commission_amount * campaign_record.platform_fee_rate / 100)::numeric, 2);

  update campaigns
     set spent = spent + new.commission_amount + new.platform_fee
   where id = new.campaign_id;

  return new;
end;
$$;

create or replace trigger before_conversion_insert
  before insert on conversions
  for each row execute function public.calculate_conversion_amounts();

-- ---------------------------------------------------------------------------
-- Stamp confirmed_at when a conversion transitions into 'confirmed'.
-- ---------------------------------------------------------------------------
create or replace function public.set_conversion_confirmed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'confirmed' and old.status is distinct from 'confirmed' then
    new.confirmed_at := coalesce(new.confirmed_at, now());
  end if;
  return new;
end;
$$;

create or replace trigger before_conversion_set_confirmed_at
  before update on conversions
  for each row execute function public.set_conversion_confirmed_at();

-- ---------------------------------------------------------------------------
-- Generic updated_at maintenance.
-- ---------------------------------------------------------------------------
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger set_updated_at before update on profiles
  for each row execute function public.update_updated_at();
create or replace trigger set_updated_at before update on brands
  for each row execute function public.update_updated_at();
create or replace trigger set_updated_at before update on creators
  for each row execute function public.update_updated_at();
create or replace trigger set_updated_at before update on campaigns
  for each row execute function public.update_updated_at();
create or replace trigger set_updated_at before update on matches
  for each row execute function public.update_updated_at();
create or replace trigger set_updated_at before update on conversions
  for each row execute function public.update_updated_at();
create or replace trigger set_updated_at before update on payouts
  for each row execute function public.update_updated_at();
