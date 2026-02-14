-- Sessions table: a shared "room" identified by a short code
-- Two people share the session_id to connect with each other
create table sessions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,        -- short shareable code e.g. "ROSE-4821"
  created_at timestamptz default now()
);

-- Locations table: each person's current GPS position
-- Updated in real-time as they move
create table locations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  user_token text not null,         -- random token stored in localStorage, identifies the user
  latitude float8 not null,
  longitude float8 not null,
  updated_at timestamptz default now(),

  -- Only one row per user per session
  unique(session_id, user_token)
);

-- Index for fast lookups by session
create index locations_session_id_idx on locations(session_id);

-- Enable Row Level Security
alter table sessions enable row level security;
alter table locations enable row level security;

-- Sessions: anyone (anon) can create and read sessions
create policy "Anyone can create a session"
  on sessions for insert
  to anon
  with check (true);

create policy "Anyone can read sessions"
  on sessions for select
  to anon
  using (true);

-- Locations: anyone can insert/update their own location and read all locations in any session
create policy "Anyone can upsert their location"
  on locations for insert
  to anon
  with check (true);

create policy "Anyone can update their location"
  on locations for update
  to anon
  using (true);

create policy "Anyone can read locations"
  on locations for select
  to anon
  using (true);

-- Enable Realtime for live location updates
alter publication supabase_realtime add table locations;
