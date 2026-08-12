-- Rename the "gallery" section to "photography" (display/URL rename only -
-- existing storage paths keep their historical "gallery/..." folder prefix,
-- which is just a filing detail and not read back from the section column).
alter table photos drop constraint photos_section_check;
update photos set section = 'photography' where section = 'gallery';
alter table photos add constraint photos_section_check
  check (section in ('photography', 'prints'));
