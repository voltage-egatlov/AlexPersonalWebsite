-- The home hero renders with object-fit: cover, which crops in tight on
-- narrow mobile viewports. Without this, the crop always centered on the
-- photo's exact middle regardless of where the actual subject sits. Let the
-- admin click a spot on each photo to pin what stays in frame, so any photo
-- can be set as the hero without hand-tuning CSS per image.
alter table photos add column if not exists focal_x numeric not null default 50;
alter table photos add column if not exists focal_y numeric not null default 50;
