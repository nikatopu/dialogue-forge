"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Workflow, LifeBuoy, Mail, BookOpen, Map,
} from "lucide-react";
import { FAQ_GROUPS } from "@/lib/support/faq";
import { FaqItem } from "./FaqItem";
import { ContactForm } from "./ContactForm";
import style from "./SupportPage.module.scss";

export function SupportPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={style.page}>
      <header className={style.header}>
        <Link href="/" className={style.brand}>
          <div className={style.brandMark}><Workflow size={14} /></div>
          <span className={style.brandName}>Dialogue Forge</span>
        </Link>
        <div className={style.headerDivider} />
        <Link href="/editor" className={style.backLink}>
          <ArrowLeft size={14} />Back to editor
        </Link>
      </header>

      <main className={style.main}>
        <section className={style.hero}>
          <div className={style.heroIcon}><LifeBuoy size={20} /></div>
          <h1 className={style.title}>Support</h1>
          <p className={style.subtitle}>
            Answers to the questions we get most, and a direct line to us for
            everything else.
          </p>
          <div className={style.heroLinks}>
            <Link href="/how-to-use" className={style.heroLink}>
              <BookOpen size={13} />How to use
            </Link>
            <Link href="/roadmap" className={style.heroLink}>
              <Map size={13} />Roadmap
            </Link>
          </div>
        </section>

        <section aria-labelledby="faq-heading" className={style.section}>
          <h2 id="faq-heading" className={style.sectionTitle}>
            Frequently asked questions
          </h2>

          <div className={style.groups}>
            {FAQ_GROUPS.map((group) => (
              <div key={group.title} className={style.group}>
                <p className={style.groupTitle}>{group.title}</p>
                <div className={style.groupItems}>
                  {group.entries.map((entry) => (
                    <FaqItem
                      key={entry.id}
                      entry={entry}
                      open={openId === entry.id}
                      onToggle={() => setOpenId((c) => (c === entry.id ? null : entry.id))}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="contact-heading" className={style.section}>
          <h2 id="contact-heading" className={style.sectionTitle}>
            Still stuck? Send us a message
          </h2>
          <p className={style.sectionLead}>
            Describe the problem in as much detail as you can — the more context,
            the faster we can help.
          </p>
          <div className={style.formCard}>
            <div className={style.formCardHeader}>
              <Mail size={14} className={style.formCardIcon} />
              <span className={style.formCardTitle}>Contact us</span>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
    </div>
  );
}
