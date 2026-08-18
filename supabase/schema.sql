-- Scout — run this in the Supabase SQL editor.
-- All public tables/types for this app are prefixed with realestate_scout_
-- so they can live alongside other projects in the same database.

create extension if not exists "pgcrypto";

create type realestate_scout_property_type as enum (
  'condo', 'shophouse', 'townhouse', 'land', 'house',
  'apartment', 'office', 'retail', 'warehouse', 'mixed_use', 'other'
);

create type realestate_scout_property_strategy as enum (
  'rental', 'flip', 'both', 'undecided'
);

create type realestate_scout_property_stage as enum (
  'seen', 'contacted', 'viewed', 'analyzing', 'offer', 'passed', 'closed'
);

create type realestate_scout_listing_source as enum (
  'sign', 'agent', 'facebook', 'web', 'walk-by', 'other'
);

create type realestate_scout_location_source as enum (
  'device', 'manual', 'extracted'
);

create type realestate_scout_media_kind as enum (
  'sign', 'gallery', 'renovation'
);

create type realestate_scout_reno_plan_status as enum (
  'draft', 'active', 'complete'
);

create type realestate_scout_reno_item_status as enum (
  'todo', 'doing', 'done', 'skipped'
);

create table public.realestate_scout_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.realestate_scout_properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.realestate_scout_profiles (id) on delete cascade,
  type realestate_scout_property_type,
  strategy realestate_scout_property_strategy not null default 'undecided',
  stage realestate_scout_property_stage not null default 'seen',
  title text,
  address_full text,
  district text,
  subdistrict text,
  province text default 'Bangkok',
  lat double precision,
  lng double precision,
  location_accuracy_m integer,
  location_source realestate_scout_location_source default 'device',
  usable_sqm numeric,
  land_sqm numeric,
  beds integer,
  baths integer,
  parking integer,
  asking_price numeric,
  currency text not null default 'THB',
  phone text,
  agent_name text,
  agency text,
  ownership text,
  condition text,
  year_built integer,
  alley_width_m numeric,
  corner_lot boolean default false,
  flood_note text,
  nearest_station text,
  station_distance_m integer,
  score integer check (score is null or (score >= 0 and score <= 100)),
  tags text[] not null default '{}',
  source realestate_scout_listing_source default 'other',
  original_text text,
  translated_summary text,
  intake_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.realestate_scout_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.realestate_scout_properties (id) on delete cascade,
  owner_id uuid not null references public.realestate_scout_profiles (id) on delete cascade,
  kind realestate_scout_media_kind not null,
  storage_path text not null,
  caption text,
  captured_lat double precision,
  captured_lng double precision,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.realestate_scout_notes (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.realestate_scout_properties (id) on delete cascade,
  owner_id uuid not null references public.realestate_scout_profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.realestate_scout_renovation_plans (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references public.realestate_scout_properties (id) on delete cascade,
  owner_id uuid not null references public.realestate_scout_profiles (id) on delete cascade,
  title text not null default 'Renovation plan',
  status realestate_scout_reno_plan_status not null default 'draft',
  currency text not null default 'THB',
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.realestate_scout_renovation_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.realestate_scout_renovation_plans (id) on delete cascade,
  owner_id uuid not null references public.realestate_scout_profiles (id) on delete cascade,
  room text,
  category text,
  description text not null,
  quantity numeric not null default 1,
  unit text not null default 'item',
  unit_cost numeric not null default 0,
  status realestate_scout_reno_item_status not null default 'todo',
  sort_order integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index realestate_scout_properties_owner_idx
  on public.realestate_scout_properties (owner_id, created_at desc);
create index realestate_scout_properties_stage_idx
  on public.realestate_scout_properties (stage);
create index realestate_scout_media_property_idx
  on public.realestate_scout_media (property_id, kind, sort_order);
create index realestate_scout_notes_property_idx
  on public.realestate_scout_notes (property_id, created_at desc);
create index realestate_scout_reno_items_plan_idx
  on public.realestate_scout_renovation_items (plan_id, sort_order);

create or replace function public.realestate_scout_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger realestate_scout_properties_updated_at
  before update on public.realestate_scout_properties
  for each row execute function public.realestate_scout_set_updated_at();
create trigger realestate_scout_notes_updated_at
  before update on public.realestate_scout_notes
  for each row execute function public.realestate_scout_set_updated_at();
create trigger realestate_scout_reno_plans_updated_at
  before update on public.realestate_scout_renovation_plans
  for each row execute function public.realestate_scout_set_updated_at();
create trigger realestate_scout_reno_items_updated_at
  before update on public.realestate_scout_renovation_items
  for each row execute function public.realestate_scout_set_updated_at();
create trigger realestate_scout_profiles_updated_at
  before update on public.realestate_scout_profiles
  for each row execute function public.realestate_scout_set_updated_at();

create or replace function public.realestate_scout_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.realestate_scout_profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger realestate_scout_on_auth_user_created
  after insert on auth.users
  for each row execute function public.realestate_scout_handle_new_user();

insert into public.realestate_scout_profiles (id, full_name)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', '')
from auth.users
on conflict (id) do nothing;

alter table public.realestate_scout_profiles enable row level security;
alter table public.realestate_scout_properties enable row level security;
alter table public.realestate_scout_media enable row level security;
alter table public.realestate_scout_notes enable row level security;
alter table public.realestate_scout_renovation_plans enable row level security;
alter table public.realestate_scout_renovation_items enable row level security;

create policy "realestate_scout own profile" on public.realestate_scout_profiles
  for all to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "realestate_scout own properties" on public.realestate_scout_properties
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "realestate_scout own media" on public.realestate_scout_media
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "realestate_scout own notes" on public.realestate_scout_notes
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "realestate_scout own reno plans" on public.realestate_scout_renovation_plans
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "realestate_scout own reno items" on public.realestate_scout_renovation_items
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('realestate_scout_media', 'realestate_scout_media', false)
on conflict (id) do nothing;

create policy "realestate_scout media read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'realestate_scout_media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "realestate_scout media insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'realestate_scout_media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "realestate_scout media update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'realestate_scout_media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "realestate_scout media delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'realestate_scout_media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
