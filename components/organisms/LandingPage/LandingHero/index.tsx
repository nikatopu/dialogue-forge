"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { GraphPreview } from "./GraphPreview";
import style from "./LandingHero.module.scss";

const TRUST_CHIPS = [
  "No account needed",
  "Free incl. commercial use",
  "Exports to any engine",
];

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
          Branching dialogue, forged in your browser.
        </span>

        <h1 className={style.title}>
          The free, zero&#8209;setup
          <br />
          <span className={style.titleAccent}>visual dialogue editor</span>
        </h1>

        <p className={style.subtitle}>
          Design branching conversations as a graph, gate them behind variables
          and conditions, then export clean JSON to Unity, Godot, Unreal, or any
          custom runtime. No account, no seat pricing, no lock-in.
        </p>

        <div className={style.actions}>
          <Link href="/editor" className={style.primaryCta}>
            Open the editor — no signup
            <ArrowRight size={15} />
          </Link>
          <a href="#how-it-works" className={style.secondaryCta}>
            See how it works
          </a>
        </div>

        <ul className={style.trustChips}>
          {TRUST_CHIPS.map((chip) => (
            <li key={chip} className={style.trustChip}>
              <Check size={13} />
              {chip}
            </li>
          ))}
        </ul>
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
