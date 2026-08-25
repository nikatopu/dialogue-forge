"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import style from "./ClosingCta.module.scss";

export function ClosingCta() {
  return (
    <section className={style.section}>
      <motion.div
        className={style.panel}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <h2 className={style.title}>Open the canvas and start writing</h2>
        <p className={style.subtitle}>
          No sign-up, no trial, no export paywall. The editor is right there.
        </p>
        <div className={style.actions}>
          <Link href="/editor" className={style.primaryCta}>
            Open the editor
            <ArrowRight size={15} />
          </Link>
          <Link href="/how-to-use" className={style.secondaryCta}>
            Read the guide
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
