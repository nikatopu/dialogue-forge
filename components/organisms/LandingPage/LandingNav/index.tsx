"use client";

import Link from "next/link";
import { Workflow } from "lucide-react";
import style from "./LandingNav.module.scss";

const LINKS = [
  { href: "/how-to-use", label: "How to use" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/support", label: "Support" },
];

export function LandingNav() {
  return (
    <header className={style.nav}>
      <Link href="/" className={style.brand}>
        <span className={style.logo}><Workflow size={14} className={style.logoIcon} /></span>
        <span className={style.brandName}>Dialogue Forge</span>
      </Link>

      <nav className={style.links}>
        {LINKS.map(({ href, label }) => (
          <Link key={href} href={href} className={style.link}>{label}</Link>
        ))}
      </nav>

      <div className={style.actions}>
        <Link href="/projects" className={style.projectsLink}>Projects</Link>
        <Link href="/editor" className={style.cta}>Open editor</Link>
      </div>
    </header>
  );
}
