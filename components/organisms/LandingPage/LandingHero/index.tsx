"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { GraphPreview } from "./GraphPreview";
import style from "./LandingHero.module.scss";

export function LandingHero() {
  return (
    <section className={style.hero}>
      <motion.div
        className={style.content}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <span className={style.eyebrow}>
          <Sparkles size={12} />
          Free, local-first, no account required
        </span>

        <h1 className={style.title}>
          Branching dialogue,<br />
          <span className={style.titleAccent}>drawn as a graph</span>
        </h1>

        <p className={style.subtitle}>
          Dialogue Forge is a visual editor for the conversations in your game.
          Wire up choices, gate them behind variables, play the whole thing back
          in the browser, then export one structured JSON file your engine can
          traverse.
        </p>

        <div className={style.actions}>
          <Link href="/editor" className={style.primaryCta}>
            Open the editor
            <ArrowRight size={15} />
          </Link>
          <Link href="/editor?demo=1" className={style.secondaryCta}>
            Load the demo project
          </Link>
        </div>

        <p className={style.note}>
          Nothing to install. Your work stays in your browser until you choose otherwise.
        </p>
      </motion.div>

      <motion.div
        className={style.preview}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.4, 0, 0.2, 1] }}
      >
        <GraphPreview />
      </motion.div>
    </section>
  );
}
