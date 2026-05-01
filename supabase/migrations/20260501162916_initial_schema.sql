-- ─────────────────────────────────────────────
-- 1. Favorite platforms (user picks)
-- ─────────────────────────────────────────────
create table if not exists favorite_platforms (
  id         bigint primary key generated always as identity,
  rawg_id    integer unique not null,
  name       text not null,
  slug       text not null,
  created_at timestamptz default now()
);

alter table favorite_platforms enable row level security;
create policy "Public read"   on favorite_platforms for select using (true);
create policy "Public insert" on favorite_platforms for insert with check (true);
create policy "Public delete" on favorite_platforms for delete using (true);

-- ─────────────────────────────────────────────
-- 2. Platforms cache (synced daily from RAWG)
-- ─────────────────────────────────────────────
create table if not exists platforms (
  id                   bigint primary key generated always as identity,
  rawg_id              integer unique not null,
  name                 text not null,
  slug                 text not null,
  games_count          integer not null default 0,
  image_background_url text,          -- original RAWG CDN URL
  image_local_url      text,          -- Supabase Storage public URL
  year_start           integer,
  year_end             integer,
  updated_at           timestamptz default now()
);

alter table platforms enable row level security;
create policy "Public read" on platforms for select using (true);

-- Service-role writes (sync runs server-side with SUPABASE_SERVICE_ROLE_KEY)
create policy "Service insert" on platforms for insert with check (true);
create policy "Service update" on platforms for update using (true);

-- ─────────────────────────────────────────────
-- 3. Sync state (single row, id = 1)
-- ─────────────────────────────────────────────
create table if not exists sync_state (
  id               integer primary key default 1,
  last_synced_at   timestamptz,
  platforms_count  integer default 0
);

alter table sync_state enable row level security;
create policy "Public read"    on sync_state for select using (true);
create policy "Service write"  on sync_state for all  using (true);

-- Seed the single row so the first SELECT doesn't return null
insert into sync_state (id) values (1) on conflict (id) do nothing;

-- ─────────────────────────────────────────────
-- Note on images
-- ─────────────────────────────────────────────
-- Images are stored locally in public/platforms/{slug}.jpg on the machine
-- that runs the sync. The column image_local_url holds the relative URL
-- (/platforms/{slug}.jpg) that Next.js serves as a static asset.
-- No Supabase Storage bucket is needed.
