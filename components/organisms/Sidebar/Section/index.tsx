"use client";

import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import style from "./Section.module.scss";

type SectionProps = {
  label: string;
  open: boolean;
  onToggle: () => void;
  badge?: number;
  children: ReactNode;
};

export function Section({ label, open, onToggle, badge, children }: SectionProps) {
  return (
    <div className={style.section}>
      <button type="button" onClick={onToggle} className={style.sectionToggle}>
        <div className={style.sectionLabel}>
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronRight size={14} className={style.chevron} />
          </motion.div>
          <span className={style.sectionLabelText}>{label}</span>
        </div>
        {badge !== undefined && badge > 0 && (
          <Badge variant="secondary" className={style.badge}>{badge}</Badge>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={style.collapse}
          >
            <div className={style.sectionBody}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
