"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEditorStore } from "@/store/useEditorStore";
import { NAV_ITEMS, type SettingsSection } from "./settingsConfig";
import { SettingsNav } from "./SettingsNav";
import { GeneralSection } from "./GeneralSection";
import { AppearanceSection } from "./AppearanceSection";
import { ShortcutsSection } from "./ShortcutsSection";
import { AccountSection } from "./AccountSection";
import { AboutSection } from "./AboutSection";
import style from "./SettingsPanel.module.scss";

export function SettingsPanel() {
  const { settingsOpen, setSettingsOpen } = useEditorStore();
  const [section, setSection] = useState<SettingsSection>("general");

  useEffect(() => {
    if (!settingsOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setSettingsOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen, setSettingsOpen]);

  if (typeof document === "undefined") return null;

  const close = () => setSettingsOpen(false);

  return createPortal(
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className={style.overlay}
        >
          <SettingsNav section={section} onSelect={setSection} />

          <div className={style.content}>
            <div className={style.topBar}>
              <span className={style.breadcrumb}>Settings / {NAV_ITEMS.find((n) => n.id === section)?.label}</span>
              <button type="button" aria-label="Close settings" onClick={close} className={style.closeBtn}><X size={16} /></button>
            </div>
            <div className={style.sectionScroll}>
              <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className={style.sectionPad}>
                {section === "general" && <GeneralSection onClose={close} />}
                {section === "appearance" && <AppearanceSection />}
                {section === "shortcuts" && <ShortcutsSection />}
                {section === "account" && <AccountSection />}
                {section === "about" && <AboutSection />}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
