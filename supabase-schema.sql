-- Run this in your Supabase SQL editor
create table if not exists favorite_platforms (
  id         bigint primary key generated always as identity,
  rawg_id    integer unique not null,
  name       text not null,
  slug       text not null,
  created_at timestamptz default now()
);

-- Allow public read/write (adjust with RLS for production)
alter table favorite_platforms enable row level security;

create policy "Public read" on favorite_platforms for select using (true);
create policy "Public insert" on favorite_platforms for insert with check (true);
create policy "Public delete" on favorite_platforms for delete using (true);
