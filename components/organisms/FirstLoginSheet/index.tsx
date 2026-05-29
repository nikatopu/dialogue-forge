"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import style from "./FirstLoginSheet.module.scss";

export const DISMISSED_KEY = "dialogue-forge-migration-dismissed";
export function markMigrationDismissed() { try { localStorage.setItem(DISMISSED_KEY, "1"); } catch { /* ignore */ } }
export function isMigrationDismissed(): boolean { try { return !!localStorage.getItem(DISMISSED_KEY); } catch { return false; } }

interface FirstLoginSheetProps { open: boolean; nodeCount: number; onImport: () => void; onChoose: () => void; onDismiss: () => void; }

export function FirstLoginSheet({ open, nodeCount, onImport, onChoose, onDismiss }: FirstLoginSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 32 }} className={style.container}>
          <div className={style.panel}>
            <div className={style.header}>
              <div className={style.headerLeft}>
                <div className={style.headerIcon}><Cloud size={14} style={{ color: "oklch(0.68 0.18 220)" }} /></div>
                <div>
                  <p className={style.title}>Local work found</p>
                  <p className={style.sub}>{nodeCount} node{nodeCount !== 1 ? "s" : ""} in your local draft</p>
                </div>
              </div>
              <button type="button" onClick={onDismiss} className={style.closeBtn}><X size={14} /></button>
            </div>
            <div className={style.body}>
              <p className={style.desc}>You have unsaved local work. Move it to cloud to access it from any device.</p>
              <div className={style.actions}>
                <Button size="sm" style={{ flex: 1, height: "2rem", fontSize: "0.75rem", gap: "0.375rem" }} onClick={onImport}><Cloud size={14} />Import to cloud</Button>
                <Button variant="outline" size="sm" style={{ height: "2rem", fontSize: "0.75rem" }} onClick={onChoose}>Choose</Button>
              </div>
              <button type="button" onClick={onDismiss} className={style.skipBtn}>Skip — keep working locally</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
