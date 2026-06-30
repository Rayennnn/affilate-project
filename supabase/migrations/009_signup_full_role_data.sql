-- =============================================================================
-- 009_signup_full_role_data.sql
-- Signup now collects the full profile, so handle_new_user fills the
-- brands/creators row from real metadata instead of placeholder defaults.
--   Brand:   store_name, store_url, description, gtm_id
--   Creator: niche, bio, instagram_url, tiktok_url, youtube_url, audience_size
-- Fallbacks remain ONLY to satisfy NOT NULL columns for the OAuth/admin path
-- (which can't show the form) — the email/password form always sends real data.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta        jsonb     := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role      user_role := coalesce(meta->>'role', 'creator')::user_role;
  v_full_name text      := coalesce(meta->>'full_name', '');
begin
  insert into public.profiles (id, role, full_name, email)
  values (new.id, v_role, v_full_name, new.email)
  on conflict (id) do nothing;

  if v_role = 'brand' then
    insert into public.brands (profile_id, store_name, store_url, description, gtm_id)
    values (
      new.id,
      coalesce(nullif(meta->>'store_name', ''), nullif(v_full_name, ''), 'My Store'),
      coalesce(meta->>'store_url', ''),
      nullif(meta->>'description', ''),
      nullif(meta->>'gtm_id', '')
    )
    on conflict (profile_id) do nothing;

  elsif v_role = 'creator' then
    insert into public.creators (
      profile_id, niche, bio, instagram_url, tiktok_url, youtube_url, audience_size
    )
    values (
      new.id,
      coalesce(nullif(meta->>'niche', ''), 'general'),
      nullif(meta->>'bio', ''),
      nullif(meta->>'instagram_url', ''),
      nullif(meta->>'tiktok_url', ''),
      nullif(meta->>'youtube_url', ''),
      coalesce(nullif(meta->>'audience_size', '')::integer, 0)
    )
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;
