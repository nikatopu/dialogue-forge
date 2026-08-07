"use client";

import { createPortal } from "react-dom";
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
  /* Portalled to <body>: the sheet is position:fixed, and any ancestor with a
     transform/filter/backdrop-filter (e.g. the TopBar header) would otherwise
     become its containing block and anchor it to that element instead of the
     viewport. */
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={style.container}>
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
            initial={{ y: "200%" }}
            animate={{ y: 0 }}
            exit={{ y: "200%" }}
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

            <div className={style.content}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
