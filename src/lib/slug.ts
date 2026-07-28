export function slugify(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  // Titles made only of symbols/emoji (no latin letters or digits) slugify
  // to an empty string, which would violate the collections.slug NOT NULL
  // constraint.
  return slug || "untitled";
}
