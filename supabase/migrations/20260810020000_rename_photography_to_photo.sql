-- Rename the "photography" section to "photo". Handles the DB still being
-- on the original "gallery" value too, in case the prior rename migration
-- (20260810010000) hasn't been applied yet.
alter table photos drop constraint photos_section_check;
update photos set section = 'photo' where section in ('gallery', 'photography');
alter table photos add constraint photos_section_check
  check (section in ('photo', 'prints'));
