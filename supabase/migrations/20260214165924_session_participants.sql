-- Tracks who has joined a session, independently of GPS
-- Inserted immediately on create/join, so the 2-person limit is reliable
create table session_participants (
  session_id uuid not null references sessions(id) on delete cascade,
  user_token text not null,
  joined_at timestamptz default now(),
  primary key (session_id, user_token)
);

alter table session_participants enable row level security;

create policy "Anyone can join"
  on session_participants for insert
  to anon
  with check (true);

create policy "Anyone can view participants"
  on session_participants for select
  to anon
  using (true);
