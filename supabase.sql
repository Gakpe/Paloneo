-- ============================================================
-- Africa Circle — Supabase schema
-- Run this in the Supabase SQL Editor (one shot).
-- Event privé de 90 min : RLS ouverte en lecture/écriture pour l'anon key.
-- ============================================================

-- ---------- TABLES ----------

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  role_org text not null,
  expertise text not null,
  email text,
  phone text,
  africa_familiarity int not null check (africa_familiarity between 1 and 4),
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  part int not null check (part in (1, 2)),
  content text not null,
  likes int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists connections (
  id uuid primary key default gen_random_uuid(),
  from_participant uuid not null references participants(id) on delete cascade,
  to_participant uuid not null references participants(id) on delete cascade,
  intent text not null,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists whats_next (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  wants_to_contribute text not null,
  contribution_types text[] not null default '{}',
  expertise_detail text,
  created_at timestamptz not null default now()
);

create index if not exists posts_part_created_idx on posts (part, created_at desc);
create index if not exists connections_to_idx on connections (to_participant);
create index if not exists connections_from_idx on connections (from_participant);

-- ---------- ROW LEVEL SECURITY (open for anon — private 90-min event) ----------

alter table participants enable row level security;
alter table posts enable row level security;
alter table connections enable row level security;
alter table whats_next enable row level security;

-- Drop existing policies if re-running
drop policy if exists "anon all participants" on participants;
drop policy if exists "anon all posts" on posts;
drop policy if exists "anon all connections" on connections;
drop policy if exists "anon all whats_next" on whats_next;

create policy "anon all participants" on participants
  for all to anon using (true) with check (true);
create policy "anon all posts" on posts
  for all to anon using (true) with check (true);
create policy "anon all connections" on connections
  for all to anon using (true) with check (true);
create policy "anon all whats_next" on whats_next
  for all to anon using (true) with check (true);

-- ---------- FUNCTIONS ----------
-- Atomic like increment — avoids lost updates when several participants
-- like the same post at once. Called from the app via supabase.rpc().
create or replace function increment_post_likes(post_id uuid)
returns void
language sql
as $$
  update posts set likes = likes + 1 where id = post_id;
$$;

grant execute on function increment_post_likes(uuid) to anon;

-- ---------- REALTIME ----------
-- Enable realtime broadcasts on the live tables.
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table connections;
