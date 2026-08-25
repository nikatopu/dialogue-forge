"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, BookOpen, LifeBuoy } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { APP_VERSION } from "@/lib/version";
import { useWhatsNew } from "./useWhatsNew";
import style from "./WhatsNewModal.module.scss";

/**
 * A one-time popup for returning visitors summarizing the newest release.
 * Gated by `useWhatsNew` on having used the app before and on not already
 * having dismissed this version — closing it (the X, or the backdrop) is
 * what remembers that, so it doesn't show again until the next release.
 */
export function WhatsNewModal() {
  const { open, close, release } = useWhatsNew();

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={style.overlay}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={style.backdrop}
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={style.panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="whats-new-title"
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={close}
              className={style.close}
              aria-label="Close"
            >
              <X size={14} />
            </Button>

            <div className={style.body}>
              <Badge variant="secondary" className={style.eyebrow}>
                {release.version}
              </Badge>
              <h2 id="whats-new-title" className={style.title}>
                What&apos;s New
              </h2>
              <p className={style.releaseTitle}>{release.title}</p>

              <ul className={style.list}>
                {release.sections.map((section) => (
                  <li key={section.heading} className={style.listItem}>
                    <Check size={14} className={style.listIcon} />
                    {section.heading}
                  </li>
                ))}
              </ul>
            </div>

            <div className={style.footer}>
              <span className={style.version}>Version {APP_VERSION}</span>
              <div className={style.links}>
                <a
                  href="/how-to-use?from=editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={style.link}
                >
                  <BookOpen size={13} />
                  How to use
                </a>
                <a
                  href="/support?from=editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={style.link}
                >
                  <LifeBuoy size={13} />
                  Support
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
