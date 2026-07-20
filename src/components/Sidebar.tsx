"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-tag">FILE NO. 001</span>
        <h1 className="sidebar-name">
          Alexandra
          <br />
          Nikita
        </h1>
      </div>
      <ul className="sidebar-nav">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} className={active ? "active" : ""}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="sidebar-footer">
        <span>PHOTOGRAPHY DOSSIER</span>
        <span>EST. {new Date().getFullYear()}</span>
      </div>
    </nav>
  );
}
