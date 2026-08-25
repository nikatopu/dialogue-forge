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

/** The one easing curve everything below shares. */
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
 * The route-level transition itself: fade only, no vertical motion. It wraps
 * the whole page — header included — and a header the user doesn't expect
 * to move sliding up with the rest of the page reads as a bug, not polish.
 * Each page's own content wrapper layers `childVariant`'s fade+rise on top
 * of this (see `EditorLayout`'s content vs. `TopBar`), so only the content
 * appears to shift while the header just fades in place.
 *
 * Entrance only, no `exit` — see `PageTransition` for why.
 */
export const pageVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
};
