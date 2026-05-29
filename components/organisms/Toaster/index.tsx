"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { useToastStore } from "@/lib/toast";
import cn from "classnames";
import type { ToastType } from "@/lib/toast";
import style from "./Toaster.module.scss";

const ICONS: Record<ToastType, React.ComponentType<{ size?: number }>> = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const TOAST_CLASS: Record<ToastType, string> = {
  success: style.toastSuccess,
  error:   style.toastError,
  warning: style.toastWarning,
  info:    style.toastInfo,
};

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className={style.container}>
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
              className={cn(style.toast, TOAST_CLASS[t.type])}
            >
              <span className={style.icon}><Icon size={16} /></span>
              <span className={style.message}>{t.message}</span>
              <button type="button" onClick={() => removeToast(t.id)} className={style.dismissBtn}>
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
