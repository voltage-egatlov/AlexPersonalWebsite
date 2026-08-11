import { getSiteContent } from "@/lib/site-content";

export const metadata = {
  title: "About — Alexandra Nikita",
};

// Data is live/mutable in Supabase — never prerender this at build time.
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const content = await getSiteContent();
  const paragraphs = content.aboutBody
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const contactRows = [
    content.contactPhone && {
      label: "Phone",
      href: `tel:${content.contactPhone.replace(/[^0-9+]/g, "")}`,
      value: content.contactPhone,
    },
    content.contactEmail && {
      label: "Email",
      href: `mailto:${content.contactEmail}`,
      value: content.contactEmail,
    },
    content.contactInstagramUrl && {
      label: "Instagram",
      href: content.contactInstagramUrl,
      value: `${content.contactInstagramLabel || "Instagram"} ↗`,
    },
  ].filter(Boolean) as { label: string; href: string; value: string }[];

  return (
    <div className="page">
      <div className="page-eyebrow">Subject</div>
      <h1 className="page-title">About</h1>

      {paragraphs.length === 0 ? (
        <div className="empty-block">
          <span className="stamp-tag">No records</span>
          <p>Nothing has been filed here yet.</p>
        </div>
      ) : (
        paragraphs.map((p, i) => <p key={i}>{p}</p>)
      )}

      {contactRows.length > 0 && (
        <div className="contact-block">
          {contactRows.map((row) => (
            <div className="contact-row" key={row.label}>
              <div className="label">{row.label}</div>
              <a className="value" href={row.href}>
                {row.value}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
