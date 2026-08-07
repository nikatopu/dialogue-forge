import type { Metadata } from "next";
import { SupportPage } from "@/components/organisms/SupportPage";
import { SiteFooter } from "@/components/organisms/SiteFooter";

export const metadata: Metadata = {
  title: "Support | Dialogue Forge",
  description:
    "Dialogue Forge support — frequently asked questions about projects, variables, triggers, and exporting, plus a direct contact form.",
  robots: { index: true, follow: true },
};

export default function Support() {
  return (
    <>
      <SupportPage />
      <SiteFooter />
    </>
  );
}
