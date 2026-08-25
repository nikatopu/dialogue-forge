"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { pageVariant } from "@/lib/motionVariants";

/**
 * Fades and lifts each route in as it mounts, and back out as it's replaced.
 * `initial={false}` skips this for the very first paint — a fresh load
 * should just appear, not animate in on top of the page's own entrance
 * animations. `h-full` keeps the wrapper from breaking the height:100% chain
 * the editor's layout depends on (`EditorLayout`'s `.container` is
 * `height: 100%`, which needs every ancestor down to `<body>` to be sized,
 * not just viewport-relative).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="h-full"
        variants={pageVariant}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
