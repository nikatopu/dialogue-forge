"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Visual height of the sheet. Defaults to "auto" (up to 85 vh). */
  size?: "auto" | "half" | "full";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<BottomSheetProps["size"]>, string> = {
  auto: "max-h-[85dvh]",
  half: "h-[50dvh]",
  full: "h-[92dvh]",
};

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  size = "auto",
  className,
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 flex flex-col",
              "bg-card border-t border-border rounded-t-2xl shadow-2xl overflow-hidden",
              SIZE_CLASS[size],
              className,
            )}
          >
            {/* Drag handle */}
            <div className="flex items-center justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 shrink-0">
                <span className="text-sm font-semibold">{title}</span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
