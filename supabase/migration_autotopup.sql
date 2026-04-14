-- ============================================================
-- AUTO TOP-UP MIGRATION
-- Run in Supabase → SQL Editor → paste → Run
-- ============================================================

alter table public.api_keys
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_payment_method_id text,
  add column if not exists auto_topup_enabled boolean default false not null,
  add column if not exists auto_topup_threshold integer default 1000 not null,
  add column if not exists auto_topup_pack text default 'spark' not null;
