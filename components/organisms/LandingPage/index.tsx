"use client";

import { Loader2 } from "lucide-react";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { LandingNav } from "./LandingNav";
import { LandingHero } from "./LandingHero";
import { FeatureGrid } from "./FeatureGrid";
import { ClosingCta } from "./ClosingCta";
import { useLandingTracking } from "./useLandingTracking";
import style from "./LandingPage.module.scss";

/**
 * Marketing entry point at `/`.
 *
 * Returning visitors who asked to skip it (Settings › General) are bounced to
 * `/editor` by `useLandingTracking`; while that navigation is in flight the
 * page renders a spinner rather than a flash of marketing copy.
 */
export function LandingPage() {
  const { redirecting } = useLandingTracking();

  if (redirecting) {
    return (
      <div className={style.redirecting}>
        <Loader2 size={22} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
        <p className={style.redirectingText}>Opening the editor…</p>
      </div>
    );
  }

  return (
    <div className={style.container}>
      <LandingNav />
      <main className={style.content}>
        <LandingHero />
        <FeatureGrid />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}
