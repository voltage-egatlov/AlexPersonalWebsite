"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Small monoline glyphs, hand-drawn to the dossier's stroke weight rather
// than pulled from an icon set. Only rendered on the mobile bottom tab bar
// (see .sidebar-nav-icon in globals.css) - the desktop rail stays text-only.
function IconHome() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path
        d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconPrints() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <rect x="7.5" y="3" width="12" height="9" rx="0.5" transform="rotate(7 13.5 7.5)" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4.5" y="7.5" width="14" height="13" rx="0.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconAbout() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9.5" cy="10.3" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.3 15.8c.6-1.8 1.9-2.7 3.2-2.7s2.6.9 3.2 2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.7 9.3h3.2M14.7 12.3h3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const NAV = [
  { href: "/", label: "Home", Icon: IconHome },
  { href: "/photo", label: "Photo", Icon: IconCamera },
  { href: "/prints", label: "Prints", Icon: IconPrints },
  { href: "/about", label: "About", Icon: IconAbout },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-tag">FILE NO. 001</span>
        <p className="sidebar-name">
          Alexandra{" "}
          <br />
          Nikita
        </p>
      </div>
      <ul className="sidebar-nav">
        {NAV.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
              >
                <span className="sidebar-nav-icon">
                  <Icon />
                </span>
                <span className="sidebar-nav-label">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="sidebar-footer">
        <span>PHOTO DOSSIER</span>
        <span>EST. {new Date().getFullYear()}</span>
      </div>
    </nav>
  );
}
