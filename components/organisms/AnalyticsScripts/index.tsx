"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useConsentStore } from "@/store/useConsentStore";
import { analyticsService } from "@/lib/analytics/analyticsService";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

/**
 * Loads Google Analytics and Microsoft Clarity, but only after the visitor has
 * accepted cookies. Rendering nothing until then means neither vendor script is
 * ever requested, so no cookies are set and no data leaves the browser.
 *
 * IDs come from env vars — if one is unset, that vendor is simply skipped, which
 * keeps local development and preview deployments clean.
 */
export function AnalyticsScripts() {
  const status = useConsentStore((s) => s.status);
  const granted = status === "granted";
  const pathname = usePathname();

  // GA's own SPA page-view detection is unreliable with the App Router, so
  // report navigations explicitly.
  useEffect(() => {
    if (!granted || !GA_ID || !pathname) return;
    analyticsService.trackPage(pathname);
  }, [granted, pathname]);

  if (!granted) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true, send_page_view: false });
            `}
          </Script>
        </>
      )}

      {CLARITY_ID && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        </Script>
      )}
    </>
  );
}
