-- ============================================================
-- AFFERENS DATABASE SCHEMA
-- Run this entire file in your Supabase SQL Editor
-- Dashboard → SQL Editor → paste → Run
-- ============================================================

-- API Keys table
-- Each developer gets one API key when they sign up
create table if not exists public.api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  key text unique not null,
  tokens_consumed integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

-- Only the owner can see their own API key
alter table public.api_keys enable row level security;

create policy "Users can view their own API key"
  on public.api_keys for select
  using (auth.uid() = user_id);

-- Perception events — the simulated sensory data pool the API draws from
create table if not exists public.perception_events (
  id uuid default gen_random_uuid() primary key,
  entity_id text not null,
  type text not null,
  modality text not null,
  classification text not null,
  confidence float not null,
  spatial_coords jsonb not null,
  sense_tokens_cost integer not null default 12,
  created_at timestamptz default now() not null
);

-- Anyone with a valid API key can read perception events (enforced in API route, not RLS)
alter table public.perception_events enable row level security;

-- ============================================================
-- SEED DATA — realistic simulated perception events
-- ============================================================

insert into public.perception_events (entity_id, type, modality, classification, confidence, spatial_coords, sense_tokens_cost) values
  ('ENT-0x1A3F', 'VISION', 'VISION', 'vessel', 0.9124, '{"x": 26.07, "y": -90.72, "z": 58.31}', 14),
  ('ENT-0x2B7C', 'VISION', 'VISION', 'drone', 0.8843, '{"x": 12.44, "y": -45.18, "z": 102.77}', 14),
  ('ENT-0x3D2A', 'VISION', 'VISION', 'forklift', 0.9512, '{"x": 3.21, "y": 7.88, "z": 1.20}', 14),
  ('ENT-0x4E9B', 'VISION', 'VISION', 'person', 0.9871, '{"x": 1.05, "y": 2.34, "z": 1.75}', 14),
  ('ENT-0x5F1D', 'VISION', 'VISION', 'container', 0.9234, '{"x": 8.60, "y": 14.22, "z": 2.44}', 14),
  ('ENT-0xA12C', 'SPATIAL', 'SPATIAL', 'vehicle', 0.9001, '{"x": 55.30, "y": -120.44, "z": 0.80}', 10),
  ('ENT-0xB34F', 'SPATIAL', 'SPATIAL', 'aircraft', 0.8799, '{"x": 102.11, "y": -80.55, "z": 3200.00}', 10),
  ('ENT-0xC56D', 'SPATIAL', 'SPATIAL', 'robot', 0.9654, '{"x": 0.44, "y": 1.12, "z": 0.90}', 10),
  ('ENT-0xD78E', 'ACOUSTIC', 'ACOUSTIC', 'engine_hum', 0.8321, '{"x": 5.20, "y": 3.10, "z": 0.50}', 8),
  ('ENT-0xE90A', 'ACOUSTIC', 'ACOUSTIC', 'alarm', 0.9933, '{"x": 0.00, "y": 0.00, "z": 3.00}', 8),
  ('ENT-0xF11B', 'ENVIRONMENTAL', 'ENVIRONMENTAL', 'wind_gust', 0.9988, '{"speed_kn": 18.4, "direction_deg": 220, "gust_kn": 24.1}', 6),
  ('ENT-0xG22C', 'ENVIRONMENTAL', 'ENVIRONMENTAL', 'thermal_spike', 0.9741, '{"temp_c": 87.3, "zone": "motor_bay_4", "threshold_c": 80}', 6),
  ('ENT-0xH33D', 'MOLECULAR', 'MOLECULAR', 'methane_trace', 0.9102, '{"ppm": 4.7, "gas": "CH4", "hazard_level": "low"}', 18),
  ('ENT-0xI44E', 'MOLECULAR', 'MOLECULAR', 'co2_elevated', 0.9455, '{"ppm": 1240, "gas": "CO2", "hazard_level": "moderate"}', 18),
  ('ENT-0xJ55F', 'INTEROCEPTION', 'INTEROCEPTION', 'sensor_degraded', 0.8812, '{"node": "Drone-Alpha-01", "sensor": "lidar", "health_pct": 67}', 5);

-- ============================================================
-- DONE. Your database is ready.
-- ============================================================
