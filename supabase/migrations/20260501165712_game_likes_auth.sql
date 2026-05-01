create table if not exists game_likes (
  id        bigint primary key generated always as identity,
  user_id   uuid not null references auth.users(id) on delete cascade,
  rawg_id   integer not null,
  game_name text not null,
  liked_at  timestamptz default now(),
  unique(user_id, rawg_id)
);

alter table game_likes enable row level security;
create policy "Users see own likes"    on game_likes for select using (auth.uid() = user_id);
create policy "Users insert own likes" on game_likes for insert with check (auth.uid() = user_id);
create policy "Users delete own likes" on game_likes for delete using (auth.uid() = user_id);
