"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Workflow, LifeBuoy, Mail, BookOpen, Map,
} from "lucide-react";
import { FAQ_GROUPS } from "@/lib/support/faq";
import { useBackDestination, withOrigin } from "@/lib/backDestination";
import { childVariant, containerVariant } from "@/lib/motionVariants";
import { FaqItem } from "./FaqItem";
import { ContactForm } from "./ContactForm";
import style from "./SupportPage.module.scss";

export function SupportPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const back = useBackDestination();

  return (
    <div className={style.page}>
      <header className={style.header}>
        <Link href="/" className={style.brand}>
          <div className={style.brandMark}><Workflow size={14} /></div>
          <span className={style.brandName}>Dialogue Forge</span>
        </Link>
        <div className={style.headerDivider} />
        <Link href={back.href} className={style.backLink}>
          <ArrowLeft size={14} />{back.label}
        </Link>
      </header>

      <motion.main className={style.main} variants={containerVariant} initial="hidden" animate="visible">
        <motion.section className={style.hero} variants={childVariant}>
          <div className={style.heroIcon}><LifeBuoy size={20} /></div>
          <h1 className={style.title}>Support</h1>
          <p className={style.subtitle}>
            Answers to the questions we get most, and a direct line to us for
            everything else.
          </p>
          <div className={style.heroLinks}>
            <Link href={withOrigin("/how-to-use", back)} className={style.heroLink}>
              <BookOpen size={13} />How to use
            </Link>
            <Link href={withOrigin("/roadmap", back)} className={style.heroLink}>
              <Map size={13} />Roadmap
            </Link>
          </div>
        </motion.section>

        <motion.section aria-labelledby="faq-heading" className={style.section} variants={childVariant}>
          <h2 id="faq-heading" className={style.sectionTitle}>
            Frequently asked questions
          </h2>

          <div className={style.groups}>
            {FAQ_GROUPS.map((group) => (
              <motion.div
                key={group.title}
                className={style.group}
                variants={childVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
              >
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
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section aria-labelledby="contact-heading" className={style.section} variants={childVariant}>
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
        </motion.section>
      </motion.main>
    </div>
  );
}
