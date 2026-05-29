"use client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitBranch, Globe, Workflow } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { useProjectStore } from "@/store/useProjectStore";
import style from "./SignInModal.module.scss";

export function SignInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signInWithGoogle, signInWithGitHub, isAuthLoading } = useProjectStore();
  async function handleGoogle() { await signInWithGoogle(); onClose(); }
  async function handleGitHub() { await signInWithGitHub(); onClose(); }
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className={style.overlay}>
          <div className={style.backdrop} onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ type: "spring", stiffness: 380, damping: 30 }} className={style.panel}>
            <button type="button" onClick={onClose} className={style.closeBtn}><X size={16} /></button>
            <div className={style.header}>
              <div className={style.logo}><Workflow size={22} style={{ color: "var(--primary-foreground)" }} /></div>
              <h2 className={style.title}>Sign in to Dialogue Forge</h2>
              <p className={style.subtitle}>Save your projects to the cloud, access them anywhere, and keep your work safe.</p>
            </div>
            <div className={style.providers}>
              <Button type="button" variant="outline" className={style.providerBtn} onClick={handleGoogle} disabled={isAuthLoading}><Globe size={16} style={{ flexShrink: 0 }} />Continue with Google</Button>
              <Button type="button" variant="outline" className={style.providerBtn} onClick={handleGitHub} disabled={isAuthLoading}><GitBranch size={16} style={{ flexShrink: 0 }} />Continue with GitHub</Button>
              <p className={style.terms}>By signing in you agree to our{" "}<Link href="/terms" target="_blank" className={style.termsLink}>Terms</Link>{" "}and{" "}<Link href="/privacy" target="_blank" className={style.termsLink}>Privacy Policy</Link>. Your local project is always available — signing in is optional.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
