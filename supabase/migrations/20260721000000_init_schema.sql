create extension if not exists pgcrypto;

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  file_no text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections(id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists photos_collection_id_idx on photos(collection_id);

-- Storage bucket that holds the actual image files. Public so next/image and
-- the browser can load photos directly via their public URL.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- All writes happen server-side with the service role key, which bypasses
-- RLS entirely. This policy only needs to cover public reads.
drop policy if exists "Public read access to photos bucket" on storage.objects;
create policy "Public read access to photos bucket"
on storage.objects for select
using (bucket_id = 'photos');
