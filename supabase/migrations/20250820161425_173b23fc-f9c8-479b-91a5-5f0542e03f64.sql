-- Enable required extension for UUIDs
create extension if not exists pgcrypto;

-- Create sales_data table
create table if not exists public.sales_data (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  year text not null,
  session text not null,
  "group" text not null,
  subgroup text not null,
  store text not null,
  total numeric not null,
  date text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.sales_data enable row level security;

-- Public policies (anon + authenticated) for now
create policy "Public can read sales_data"
  on public.sales_data for select
  using (true);

create policy "Public can insert sales_data"
  on public.sales_data for insert
  with check (true);

create policy "Public can update sales_data"
  on public.sales_data for update
  using (true) with check (true);

create policy "Public can delete sales_data"
  on public.sales_data for delete
  using (true);