-- =============================================================================
-- 008_signup_creates_role_rows.sql
-- Make signup create the role-specific row (brands / creators), not just the
-- profile. Previously handle_new_user only inserted into profiles, so a brand
-- had a profile but no `brands` row -> "No brand profile found" when adding a
-- product. Creators were auto-created lazily; brands never were.
--
-- This rewrites handle_new_user to also insert the brand/creator row based on
-- role, using metadata when present and safe defaults otherwise (store_url is
-- NOT NULL so it defaults to '' and is completed later in Settings).
-- Also backfills existing brand/creator profiles that are missing their row.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role      user_role := coalesce(new.raw_user_meta_data->>'role', 'creator')::user_role;
  v_full_name text      := coalesce(new.raw_user_meta_data->>'full_name', '');
begin
  insert into public.profiles (id, role, full_name, email)
  values (new.id, v_role, v_full_name, new.email)
  on conflict (id) do nothing;

  if v_role = 'brand' then
    insert into public.brands (profile_id, store_name, store_url)
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data->>'store_name', ''), nullif(v_full_name, ''), 'My Store'),
      coalesce(new.raw_user_meta_data->>'store_url', '')
    )
    on conflict (profile_id) do nothing;

  elsif v_role = 'creator' then
    insert into public.creators (profile_id, niche)
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data->>'niche', ''), 'general')
    )
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;

-- Trigger already exists (004) but re-create to be safe / idempotent.
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Backfill: existing brand/creator profiles that have no role row yet.
-- ---------------------------------------------------------------------------
insert into public.brands (profile_id, store_name, store_url)
select p.id, coalesce(nullif(p.full_name, ''), 'My Store'), ''
from public.profiles p
where p.role = 'brand'
  and not exists (select 1 from public.brands b where b.profile_id = p.id);

insert into public.creators (profile_id, niche)
select p.id, 'general'
from public.profiles p
where p.role = 'creator'
  and not exists (select 1 from public.creators c where c.profile_id = p.id);
