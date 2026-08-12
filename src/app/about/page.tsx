import type { ReactNode } from "react";
import Image from "next/image";
import { getSiteContent } from "@/lib/site-content";

export const metadata = {
  title: "About - Alexandra Nikita",
};

// Data is live/mutable in Supabase - never prerender this at build time.
export const dynamic = "force-dynamic";

// Bio copy supports plain-text Markdown-style links - [label](https://…)
// so the story can point at real places (a school, a museum, a show)
// without needing raw HTML in the admin textarea.
const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  LINK_PATTERN.lastIndex = 0;
  while ((match = LINK_PATTERN.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <a
        key={key++}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="about-inline-link"
      >
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

// A paragraph that's entirely one quoted line gets pulled out as a stamped
// pull-quote instead of blending into the surrounding prose.
function isPullQuote(paragraph: string) {
  return /^[“"].+[”"]$/.test(paragraph.trim());
}

export default async function AboutPage() {
  const content = await getSiteContent();
  const paragraphs = content.aboutBody
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\s*\r?\n\s*/g, " "))
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

  const hasContent = paragraphs.length > 0 || content.aboutPhotoUrl;

  return (
    <div className="page">
      <div className="page-eyebrow">Subject</div>
      <h1 className="page-title">About</h1>

      {!hasContent ? (
        <div className="empty-block">
          <span className="stamp-tag">No records</span>
          <p>Nothing has been filed here yet.</p>
        </div>
      ) : (
        <div className="about-layout">
          {content.aboutPhotoUrl && (
            <div className="about-photo">
              <Image
                src={content.aboutPhotoUrl}
                alt="Alexandra Nikita"
                fill
                sizes="(max-width: 720px) 100vw, 280px"
              />
            </div>
          )}

          <div className="about-copy">
            {paragraphs.map((p, i) =>
              isPullQuote(p) ? (
                <blockquote key={i} className="about-quote">
                  {renderInline(p)}
                </blockquote>
              ) : (
                <p key={i}>{renderInline(p)}</p>
              )
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
        </div>
      )}
    </div>
  );
}
