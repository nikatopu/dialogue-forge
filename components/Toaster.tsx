"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { useToastStore } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { ToastType } from "@/lib/toast";

const ICONS: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const STYLES: Record<ToastType, string> = {
  success: "border-emerald-500/30 bg-card text-emerald-400",
  error:   "border-destructive/40 bg-card text-destructive",
  warning: "border-amber-500/30 bg-card text-amber-400",
  info:    "border-primary/30 bg-card text-primary",
};

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[400] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className={cn(
                "pointer-events-auto flex items-center gap-2.5",
                "px-3.5 py-2.5 rounded-xl border shadow-2xl max-w-xs",
                STYLES[t.type],
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-xs font-medium text-foreground">{t.message}</span>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
