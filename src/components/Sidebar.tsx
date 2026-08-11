"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/photo", label: "Photo" },
  { href: "/prints", label: "Prints" },
  { href: "/about", label: "About" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-tag">FILE NO. 001</span>
        <p className="sidebar-name">
          Alexandra
          <br />
          Nikita
        </p>
      </div>
      <ul className="sidebar-nav">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
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
