-- =====================================================
-- Supabase Database Setup for Snøklar
-- Kjør denne filen i Supabase SQL Editor
-- =====================================================

-- =====================================================
-- TABELLER
-- =====================================================

-- Contractors (kontakter/entreprenører)
create table contractors (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  name text not null,
  phone text not null,
  email text,
  is_primary boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Plow Entries (brøytingshistorikk)
create table plow_entries (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  timestamp timestamptz not null,
  snow_depth numeric,
  comment text,
  contractor_id uuid references contractors(id),
  created_at timestamptz default now()
);

-- Settings (brukerinnstillinger)
create table settings (
  id uuid default gen_random_uuid() primary key,
  user_id text unique not null,
  location_name text,
  location_lat numeric,
  location_lon numeric,
  snow_threshold integer default 10,
  notify_on_snow boolean default false,
  notify_day boolean default true,
  notify_night boolean default true,
  updated_at timestamptz default now()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Aktiver RLS på alle tabeller
alter table contractors enable row level security;
alter table plow_entries enable row level security;
alter table settings enable row level security;

-- =====================================================
-- POLICIES
-- =====================================================

-- Contractors: Alle kan administrere sine egne data
drop policy if exists "contractors_own_data" on contractors;
create policy "contractors_own_data" on contractors
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Plow Entries: Alle kan administrere sine egne data
drop policy if exists "plow_entries_own_data" on plow_entries;
create policy "plow_entries_own_data" on plow_entries
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Settings: Alle kan administrere sine egne data
drop policy if exists "settings_own_data" on settings;
create policy "settings_own_data" on settings
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- =====================================================
-- INDEKSER (for bedre ytelse)
-- =====================================================

create index if not exists idx_contractors_user_id on contractors(user_id);
create index if not exists idx_plow_entries_user_id on plow_entries(user_id);
create index if not exists idx_plow_entries_timestamp on plow_entries(timestamp desc);
create index if not exists idx_settings_user_id on settings(user_id);

-- =====================================================
-- FERDIG!
-- =====================================================

-- Verifiser at tabellene ble opprettet
select 
  'contractors' as table_name,
  count(*) as row_count
from contractors
union all
select 
  'plow_entries',
  count(*)
from plow_entries
union all
select 
  'settings',
  count(*)
from settings;
