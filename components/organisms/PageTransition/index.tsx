"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { pageVariant } from "@/lib/motionVariants";

/**
 * Fades each route in as it mounts. Entrance only, deliberately no exit —
 * a navigation swaps pages immediately rather than waiting on the old one
 * to animate out first, which is what made transitions feel laggy.
 * `key={pathname}` forces a fresh mount (and so a fresh fade-in) on every
 * route change.
 *
 * Fade only, no vertical motion: this wraps the whole page, header
 * included, and a header sliding along with content it isn't part of reads
 * as broken. Any y-motion belongs to the page's own content wrapper (e.g.
 * `childVariant` inside `EditorLayout`, `RoadmapContent`), layered on top of
 * this so only the content appears to shift.
 *
 * `h-full` keeps the wrapper from breaking the height:100% chain the
 * editor's layout depends on (`EditorLayout`'s `.container` is
 * `height: 100%`, which needs every ancestor down to `<body>` sized, not
 * just viewport-relative).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div key={pathname} className="h-full" variants={pageVariant} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}
