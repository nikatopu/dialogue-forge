"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { useConsentStore } from "@/store/useConsentStore";
import style from "./CookieConsent.module.scss";

/**
 * Shown until the visitor makes a choice. Until then no analytics script is
 * loaded at all — see AnalyticsScripts.
 */
export function CookieConsent() {
  const { status, hydrated, accept, decline } = useConsentStore();

  // Waiting for hydration prevents the banner flashing for returning visitors.
  const visible = hydrated && status === "unknown";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          role="dialog"
          aria-live="polite"
          aria-label="Cookie preferences"
          className={style.banner}
        >
          <div className={style.icon}><Cookie size={16} /></div>

          <div className={style.body}>
            <p className={style.title}>We use analytics cookies</p>
            <p className={style.text}>
              We&apos;d like to use Google Analytics and Microsoft Clarity to see
              which features get used and where people get stuck. Nothing you
              write — dialogue, characters, project names — is ever collected.
              See our <Link href="/privacy" className={style.link}>Privacy Policy</Link>.
            </p>
          </div>

          <div className={style.actions}>
            <Button variant="ghost" size="sm" onClick={decline} className={style.declineBtn}>
              Decline
            </Button>
            <Button size="sm" onClick={accept}>
              Accept
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
