-- Referral system
alter table public.api_keys
  add column if not exists referral_code text unique,
  add column if not exists referred_by text,
  add column if not exists referral_redeemed boolean not null default false,
  add column if not exists referral_count integer not null default 0,
  add column if not exists is_admin boolean not null default false;

-- Backfill referral codes for existing users
update public.api_keys
set referral_code = 'REF-'
  || upper(substring(encode(gen_random_bytes(3), 'hex'), 1, 4))
  || '-'
  || upper(substring(encode(gen_random_bytes(3), 'hex'), 1, 4))
where referral_code is null;

alter table public.api_keys alter column referral_code set not null;
