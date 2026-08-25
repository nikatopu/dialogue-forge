import type { Transition, Variants } from "framer-motion";

/**
 * Shared framer-motion building blocks, so every entrance animation in the
 * app — a marketing section, a settings panel, a route change, the editor's
 * own chrome — comes from the same handful of curves instead of each place
 * re-inventing its own duration and easing.
 *
 * `container` + `child` compose for a staggered reveal:
 *
 *   <motion.div variants={containerVariant} initial="hidden" animate="visible">
 *     {items.map((item) => <motion.div key={item.id} variants={childVariant}>...</motion.div>)}
 *   </motion.div>
 *
 * Reach for `fadeVariant` when movement would be distracting (an
 * already-busy screen, something that reloads often), and `pageVariant` only
 * for the route-level transition in `PageTransition`.
 */

/** The one easing curve everything below shares, outside of `pageVariant`'s exit. */
export const EASE_OUT: Transition = { duration: 0.4, ease: [0.4, 0, 0.2, 1] };

/** Opacity only — for content that shouldn't also move. */
export const fadeVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: EASE_OUT },
};

/** Fade + a small rise. The default entrance for most content, standalone or as a `containerVariant` child. */
export const childVariant: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: EASE_OUT },
};

/** Wraps a group of `childVariant` elements to reveal them one after another instead of all at once. */
export const containerVariant: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

/**
 * A full route transition: fade + rise in, fade + a small drop out. Used by
 * `PageTransition` only. Deliberately quicker than `EASE_OUT` in both
 * directions — `AnimatePresence mode="wait"` runs the exit to completion
 * before the next route mounts, so the two durations sum into the visible
 * gap between pages, and a slow pair reads as the transition hanging.
 */
export const pageVariant: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } },
};
