import { CHANGELOG } from "./roadmap";

/**
 * The app's current version, for display (Settings → About, the What's New
 * popup). Derived from the newest changelog entry rather than duplicated by
 * hand, so shipping a release only means adding one `lib/roadmap.ts` entry.
 */
export const APP_VERSION = CHANGELOG[0].version.replace(/^v/, "");
