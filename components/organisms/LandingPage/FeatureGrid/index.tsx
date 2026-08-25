"use client";

import { motion } from "framer-motion";
import { FEATURES, STEPS } from "../landingContent";
import style from "./FeatureGrid.module.scss";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
} as const;

export function FeatureGrid() {
  return (
    <section className={style.section}>
      <motion.div className={style.header} {...fadeIn}>
        <h2 className={style.title}>Everything the conversation needs</h2>
        <p className={style.subtitle}>
          Built for the part of game writing that spreadsheets are bad at: the
          shape of the branch.
        </p>
      </motion.div>

      <motion.div className={style.grid} {...fadeIn}>
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <article key={title} className={style.card}>
            <span className={style.cardIcon}>
              <Icon size={16} />
            </span>
            <h3 className={style.cardTitle}>{title}</h3>
            <p className={style.cardDesc}>{description}</p>
          </article>
        ))}
      </motion.div>

      <motion.h2 id="how-it-works" className={style.stepsTitle} {...fadeIn}>
        How it works
      </motion.h2>

      <motion.ol className={style.steps} {...fadeIn}>
        {STEPS.map(({ number, title, description }) => (
          <li key={number} className={style.step}>
            <span className={style.stepNumber}>{number}</span>
            <h3 className={style.stepTitle}>{title}</h3>
            <p className={style.stepDesc}>{description}</p>
          </li>
        ))}
      </motion.ol>
    </section>
  );
}
