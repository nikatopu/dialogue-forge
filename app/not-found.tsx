import type { Metadata } from "next";
import { NotFoundPage } from "@/components/organisms/NotFoundPage";
import { SiteFooter } from "@/components/organisms/SiteFooter";

export const metadata: Metadata = {
  title: "Page not found | Dialogue Forge",
  description:
    "This page doesn't exist. Head back to the Dialogue Forge editor, your projects, the guides, or support.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <NotFoundPage />
      <SiteFooter />
    </>
  );
}
