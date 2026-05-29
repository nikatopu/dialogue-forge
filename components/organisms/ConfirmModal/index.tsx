"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import style from "./ConfirmModal.module.scss";

interface ConfirmModalProps { open: boolean; title: string; message: string; confirmLabel?: string; cancelLabel?: string; variant?: "danger" | "default"; onConfirm: () => void; onCancel: () => void; }

export function ConfirmModal({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", variant = "danger", onConfirm, onCancel }: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onCancel(); if (e.key === "Enter") onConfirm(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onConfirm, onCancel]);
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className={style.overlay} onClick={onCancel}>
          <div className={style.backdrop} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ type: "spring", stiffness: 380, damping: 28 }} className={style.panel} onClick={(e) => e.stopPropagation()}>
            <div className={style.body}>
              <div className={style.iconRow}>
                {variant === "danger" && <div className={style.dangerIcon}><AlertTriangle size={18} style={{ color: "var(--destructive)" }} /></div>}
                <div><h2 className={style.title}>{title}</h2><p className={style.message}>{message}</p></div>
              </div>
              <div className={style.actions}>
                <Button variant="ghost" size="sm" onClick={onCancel}>{cancelLabel}</Button>
                <Button size="sm" variant={variant === "danger" ? "destructive" : "default"} onClick={onConfirm}>{confirmLabel}</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
