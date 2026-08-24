"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import cn from "classnames";
import { Button } from "@/components/atoms/Button";
import type { ExportEngine } from "@/lib/enginePreference";
import style from "./EnginePickerModal.module.scss";

interface EnginePickerModalProps {
  open: boolean;
  initialEngine: ExportEngine;
  onConfirm: (engine: ExportEngine, dontShowAgain: boolean) => void;
  onCancel: () => void;
}

const ENGINE_OPTIONS: { value: ExportEngine; label: string }[] = [
  { value: "unity", label: "Unity" },
  { value: "godot", label: "Godot" },
  { value: "unreal", label: "Unreal" },
  { value: "other", label: "Other / custom" },
];

export function EnginePickerModal({ open, initialEngine, onConfirm, onCancel }: EnginePickerModalProps) {
  const [engine, setEngine] = useState<ExportEngine>(initialEngine);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Reset the picker's choices whenever it transitions from closed to open,
  // so a prior pick doesn't linger visually into the next save/export prompt.
  // Adjusted during render (React's documented pattern for this) rather than
  // in an effect, to avoid the extra commit a setState-in-effect would cause.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setEngine(initialEngine);
      setDontShowAgain(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className={style.overlay} onClick={onCancel}>
          <div className={style.backdrop} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ type: "spring", stiffness: 380, damping: 28 }} className={style.panel} onClick={(e) => e.stopPropagation()}>
            <div className={style.body}>
              <div className={style.iconRow}>
                <div className={style.headerIcon}>
                  <Gamepad2 size={18} style={{ color: "var(--accent-blue)" }} />
                </div>
                <div>
                  <h2 className={style.title}>Which engine is this for?</h2>
                  <p className={style.message}>
                    The exported JSON is the same either way — this just helps us tailor tips to your export.
                  </p>
                </div>
              </div>

              <div className={style.options} role="radiogroup" aria-label="Target engine">
                {ENGINE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={engine === opt.value}
                    className={cn(style.option, engine === opt.value && style.optionSelected)}
                    onClick={() => setEngine(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button type="button" onClick={() => setDontShowAgain((v) => !v)} className={style.dontShowBtn}>
                <div className={cn(style.checkbox, dontShowAgain && style.checkboxChecked)}>
                  {dontShowAgain && (
                    <svg viewBox="0 0 10 8" className={style.checkIcon} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1,4 3.5,6.5 9,1" />
                    </svg>
                  )}
                </div>
                <span className={style.dontShowLabel}>Don&apos;t show this again for 7 days</span>
              </button>

              <div className={style.actions}>
                <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
                <Button size="sm" onClick={() => onConfirm(engine, dontShowAgain)}>Continue</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
