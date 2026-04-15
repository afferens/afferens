-- ============================================================
-- COMMANDS TABLE MIGRATION
-- Run in Supabase → SQL Editor → paste → Run
-- ============================================================

create table if not exists public.commands (
  id uuid default gen_random_uuid() primary key,
  api_key_id uuid references public.api_keys(id) on delete cascade not null,
  target_node_id text not null,
  command_type text not null,
  parameters jsonb default '{}' not null,
  status text default 'queued' not null,
  sense_tokens_cost integer default 5 not null,
  created_at timestamptz default now() not null,
  executed_at timestamptz
);

alter table public.commands enable row level security;

create policy "Service role can do everything on commands"
  on public.commands for all
  using (true);
