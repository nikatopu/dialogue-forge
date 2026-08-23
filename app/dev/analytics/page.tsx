import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AnalyticsDevPanel } from "@/components/organisms/AnalyticsDevPanel";

export const metadata: Metadata = {
  title: "Analytics capture",
  robots: { index: false, follow: false },
};

/**
 * Local verification surface for the activation funnel.
 *
 * Returns a 404 in production builds — this exposes no data a visitor could
 * not already read out of their own localStorage, but it is a developer tool
 * and has no business being routable on the live site.
 */
export default function AnalyticsDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <AnalyticsDevPanel />;
}
