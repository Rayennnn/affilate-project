-- =============================================================================
-- 001_create_enums.sql
-- Enum types for the UGC affiliate marketplace.
-- Idempotent: CREATE TYPE has no IF NOT EXISTS, so each type is wrapped in a
-- guarded DO block that no-ops if the type already exists.
-- =============================================================================

do $$ begin
  create type user_role as enum ('brand', 'creator', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type campaign_status as enum ('draft', 'active', 'paused', 'completed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type match_status as enum ('pending', 'approved', 'rejected', 'completed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type conversion_source as enum ('gtm', 'sheet', 'manual');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type conversion_status as enum ('pending', 'confirmed', 'cancelled', 'paid');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payout_status as enum ('pending', 'processing', 'completed', 'failed');
exception when duplicate_object then null;
end $$;
