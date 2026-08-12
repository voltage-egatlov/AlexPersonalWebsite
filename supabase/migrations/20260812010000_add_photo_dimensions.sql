-- Store each photo's real pixel dimensions so the public gallery can lay
-- them out at their natural aspect ratio (a justified row layout) instead
-- of cropping everything into uniform squares. Nullable + backfilled
-- separately for photos uploaded before this column existed; the gallery
-- falls back to a reasonable default ratio when either is null.
alter table photos add column if not exists width integer;
alter table photos add column if not exists height integer;
