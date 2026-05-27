import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/Toaster";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dialogue Forge — Visual Dialogue Tree Editor",
    template: "%s | Dialogue Forge",
  },
  description:
    "Build branching dialogue trees for games and interactive fiction. Export structured JSON for Unity, Godot, Unreal Engine, and any custom runtime.",
  keywords: [
    "dialogue editor",
    "branching narrative",
    "visual novel",
    "game dialogue",
    "dialogue tree",
    "interactive fiction",
    "game dev tools",
    "JSON export",
  ],
  openGraph: {
    title: "Dialogue Forge — Visual Dialogue Tree Editor",
    description:
      "Visual node-based editor for branching dialogue. Design conversations as a graph and export structured JSON for any game engine.",
    type: "website",
    siteName: "Dialogue Forge",
  },
  twitter: {
    card: "summary",
    title: "Dialogue Forge",
    description:
      "Visual dialogue tree editor for games. Export structured JSON for Unity, Godot, Unreal, and web.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="h-full">
        <TooltipProvider delayDuration={400}>
          <ThemeProvider>{children}</ThemeProvider>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
