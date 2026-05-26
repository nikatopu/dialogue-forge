"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitBranch, Globe, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/useProjectStore";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

export function SignInModal({ open, onClose }: SignInModalProps) {
  const { signInWithGoogle, signInWithGitHub, isAuthLoading } =
    useProjectStore();

  async function handleGoogle() {
    await signInWithGoogle();
    onClose();
  }

  async function handleGitHub() {
    await signInWithGitHub();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[300] w-full h-[100vh] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="px-7 pt-8 pb-6 text-center">
              <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                <Workflow className="w-5.5 h-5.5 text-primary-foreground" />
              </div>
              <h2 className="text-base font-semibold mb-1.5">
                Sign in to Dialogue Forge
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Save your projects to the cloud, access them anywhere, and keep
                your work safe.
              </p>
            </div>

            {/* Providers */}
            <div className="px-7 pb-7 space-y-2.5">
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 gap-3 text-sm font-medium"
                onClick={handleGoogle}
                disabled={isAuthLoading}
              >
                <Globe className="w-4 h-4 shrink-0" />
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 gap-3 text-sm font-medium"
                onClick={handleGitHub}
                disabled={isAuthLoading}
              >
                <GitBranch className="w-4 h-4 shrink-0" />
                Continue with GitHub
              </Button>

              <p className="text-[10px] text-muted-foreground/60 text-center pt-1 leading-relaxed">
                By signing in you agree to our{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
                >
                  Terms
                </Link>
                {" "}and{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
                . Your local project is always available — signing in is optional.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
