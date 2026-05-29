"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import cn from "classnames";
import style from "./BottomSheet.module.scss";

type BottomSheetSize = "auto" | "half" | "full";

const SIZE_CLASS: Record<BottomSheetSize, string> = {
  auto: style.sizeAuto,
  half: style.sizeHalf,
  full: style.sizeFull,
};

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: BottomSheetSize;
  className?: string;
}

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
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className={style.backdrop}
          />

          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className={cn(style.sheet, SIZE_CLASS[size], className)}
          >
            <div className={style.handle}>
              <div className={style.handleBar} />
            </div>

            {title && (
              <div className={style.header}>
                <span className={style.title}>{title}</span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className={style.closeButton}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className={style.content}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
