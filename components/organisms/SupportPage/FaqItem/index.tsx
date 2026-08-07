"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import cn from "classnames";
import type { FaqEntry } from "@/lib/support/faq";
import style from "./FaqItem.module.scss";

type FaqItemProps = {
  entry: FaqEntry;
  open: boolean;
  onToggle: () => void;
};

export function FaqItem({ entry, open, onToggle }: FaqItemProps) {
  const panelId = `faq-panel-${entry.id}`;
  const buttonId = `faq-button-${entry.id}`;

  return (
    <div className={cn(style.item, open && style.itemOpen)}>
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={style.question}
      >
        <span className={style.questionText}>{entry.question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className={style.chevron}
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.2, ease: "easeOut" },
            }}
            className={style.answerWrap}
          >
            <div className={style.answer}>
              {entry.answer.map((paragraph, i) => (
                <p key={i} className={style.answerText}>{paragraph}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
