/**
 * The one hostname allowed to be indexed. `staging.dialogueforge.org`,
 * Vercel's per-deployment preview URLs, and localhost all answer with the
 * same build (staging merges into main), so the split can't live in code
 * that differs between branches — it has to be a runtime check against the
 * actual incoming request host instead. `proxy.ts` uses this to stamp
 * non-production responses `noindex`, and `app/robots.ts` uses it to keep
 * well-behaved crawlers from fetching anything there at all.
 *
 * Reads `NEXT_PUBLIC_SITE_URL` rather than a second hardcoded domain, so
 * this can't drift from the canonical URL `app/layout.tsx` already builds
 * metadata from.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dialogueforge.org";

export const PRODUCTION_HOST = new URL(SITE_URL).hostname;

export function isProductionHost(host: string | null): boolean {
  if (!host) return false;
  return host.split(":")[0] === PRODUCTION_HOST; // strip a port, e.g. "localhost:3000"
}
