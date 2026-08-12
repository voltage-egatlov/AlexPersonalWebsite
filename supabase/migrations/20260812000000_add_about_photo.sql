-- The About page gets a portrait alongside the bio copy. Reuses the same
-- "photos" storage bucket (path prefix "about/") rather than the
-- photos table, since this is a single fixed image, not a gallery.
alter table site_content add column if not exists about_photo_path text;
