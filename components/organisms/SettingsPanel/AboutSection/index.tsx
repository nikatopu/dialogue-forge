"use client";

import Link from "next/link";
import { Map, BookOpen, LifeBuoy, ExternalLink } from "lucide-react";
import { Separator } from "@/components/atoms/Separator";
import sections from "../sections.module.scss";
import style from "./AboutSection.module.scss";

export function AboutSection() {
  return (
    <div>
      <div className={sections.sectionHeader}><h2 className={sections.sectionTitle}>About</h2></div>
      <div className={style.aboutCard}>
        <p className={style.aboutTitle}>Dialogue Forge</p>
        <p className={style.aboutDesc}>A visual branching dialogue editor for games and interactive fiction. Build node-based conversation graphs and export structured JSON for any engine.</p>
        <p className={style.aboutVersion}>Version 1.4.2</p>
      </div>
      <div className={style.linkList}>
        <a href="/support" target="_blank" rel="noopener noreferrer" className={style.linkItem}>
          <div className={style.linkLeft}><LifeBuoy size={14} />Support &amp; FAQ</div>
          <ExternalLink size={12} className={style.externalIcon} />
        </a>
        <a href="/roadmap" target="_blank" rel="noopener noreferrer" className={style.linkItem}>
          <div className={style.linkLeft}><Map size={14} />Roadmap</div>
          <ExternalLink size={12} className={style.externalIcon} />
        </a>
        <a href="/how-to-use" target="_blank" rel="noopener noreferrer" className={style.linkItem}>
          <div className={style.linkLeft}><BookOpen size={14} />How to use</div>
          <ExternalLink size={12} className={style.externalIcon} />
        </a>
        <Separator className={style.linkSeparator} />
        <Link href="/privacy" target="_blank" className={style.linkItem}>Privacy Policy</Link>
        <Link href="/terms" target="_blank" className={style.linkItem}>Terms of Service</Link>
      </div>
    </div>
  );
}
