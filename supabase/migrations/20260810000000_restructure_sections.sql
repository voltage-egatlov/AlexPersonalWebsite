-- Replace the "collections" model (many named albums, each holding photos)
-- with two fixed, flat sections — "gallery" and "prints" — plus a singleton
-- table for the About page's editable copy (which now also carries the
-- contact details that used to live on their own page).

-- Every existing photo becomes a "gallery" photo: that's the closest match
-- to what the old undifferentiated collections list represented.
alter table photos add column section text;
update photos set section = 'gallery';
alter table photos alter column section set not null;
alter table photos add constraint photos_section_check
  check (section in ('gallery', 'prints'));

alter table photos drop column collection_id;

drop table if exists collections;

create table if not exists site_content (
  id integer primary key default 1,
  about_body text not null default '',
  contact_phone text not null default '',
  contact_email text not null default '',
  contact_instagram_label text not null default '',
  contact_instagram_url text not null default '',
  updated_at timestamptz not null default now(),
  constraint site_content_singleton check (id = 1)
);

insert into site_content (
  id, about_body, contact_phone, contact_email,
  contact_instagram_label, contact_instagram_url
)
values (
  1,
  E'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  '702.444.5423',
  'al3xandranikita@gmail.com',
  'Instagram',
  ''
)
on conflict (id) do nothing;

-- All writes happen server-side with the service role key, which bypasses
-- RLS entirely (see 20260721010000_enable_rls.sql for the same reasoning
-- applied to collections/photos). No policies needed since the app never
-- uses the anon key.
alter table site_content enable row level security;
