import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { isProductionHost } from "@/lib/productionHost";

/**
 * Dynamic rather than a static `public/robots.txt` so it can read the
 * actual request host — reading `headers()` here is what makes this render
 * per-request instead of once at build time. See `lib/productionHost.ts`
 * for why the host is the thing being checked.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host");

  if (!isProductionHost(host)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return { rules: { userAgent: "*", allow: "/" } };
}
