import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/atoms/Tooltip";
import { ThemeProvider } from "@/components/organisms/ThemeProvider";
import { PageTransition } from "@/components/organisms/PageTransition";
import { Toaster } from "@/components/organisms/Toaster";
import { CookieConsent } from "@/components/organisms/CookieConsent";
import { AnalyticsScripts } from "@/components/organisms/AnalyticsScripts";
import { AnalyticsProvider } from "@/components/organisms/AnalyticsProvider";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Canonical origin. Relative URLs in metadata (OG images, alternates) resolve
 * against this, so it must match the live domain. Override per-environment
 * with NEXT_PUBLIC_SITE_URL for preview deployments.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dialogueforge.org";

/** The ~160-char version for search results and Twitter; openGraph gets the fuller statement below. */
const DESCRIPTION =
  "Free, zero-setup visual dialogue editor for game developers. Design conversations as a graph and export clean JSON to Unity, Godot, Unreal, or any engine. No lock-in.";

const TITLE = "Dialogue Forge — Free Visual Dialogue Editor for Game Devs";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: {
    default: TITLE,
    template: "%s | Dialogue Forge",
  },
  description: DESCRIPTION,
  keywords: [
    "dialogue editor",
    "branching narrative",
    "visual novel",
    "game dialogue",
    "dialogue tree",
    "interactive fiction",
    "game dev tools",
    "JSON export",
    "Unity dialogue system",
    "Godot dialogue system",
  ],
  openGraph: {
    title: TITLE,
    description:
      "The free, zero-setup visual dialogue editor for game developers. Design branching conversations as a graph and export clean JSON to Unity, Godot, Unreal, or any custom runtime. No account, no seat pricing, no lock-in.",
    type: "website",
    siteName: "Dialogue Forge",
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dialogue Forge — a branching dialogue graph exporting to dialogue.json for Unity, Godot, and Unreal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

/*
 * Applies the persisted theme before first paint so a light-mode user doesn't
 * get a dark flash. Mirrors lib/applyTheme.ts — change both together. SSR
 * renders the dark default, and this only diverges when `mode` says light.
 */
const THEME_INIT_SCRIPT = `(function(){try{
var raw=localStorage.getItem("dialogue-forge-ui");if(!raw)return;
var s=(JSON.parse(raw)||{}).state||{};
var light=s.mode==="light";var h=document.documentElement;
h.classList.toggle("dark",!light);h.classList.toggle("light",light);
h.style.colorScheme=light?"light":"dark";
if(s.theme&&s.theme!=="default")h.setAttribute("data-theme",s.theme);
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ colorScheme: "dark" }}
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="h-full">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <TooltipProvider delayDuration={400}>
          <ThemeProvider>
            <PageTransition>{children}</PageTransition>
          </ThemeProvider>
        </TooltipProvider>
        <Toaster />
        <CookieConsent />
        <AnalyticsScripts />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
