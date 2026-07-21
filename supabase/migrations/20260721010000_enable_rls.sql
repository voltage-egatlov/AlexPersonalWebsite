-- All app access (reads and writes) goes through the service role key
-- server-side, which bypasses RLS entirely. Enabling RLS here with no
-- policies just closes off the auto-generated PostgREST API to the
-- anon/authenticated roles, so the anon key can't read or mutate rows
-- directly. No policies needed since the app never uses the anon key.
alter table collections enable row level security;
alter table photos enable row level security;
