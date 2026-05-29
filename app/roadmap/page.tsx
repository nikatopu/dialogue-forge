import type { Metadata } from "next";
import { RoadmapContent } from "./content";
import { SiteFooter } from "@/components/organisms/SiteFooter";

export const metadata: Metadata = {
  title: "Roadmap | Dialogue Forge",
  description:
    "Dialogue Forge product roadmap — shipped features, in-progress work, and upcoming plans.",
  robots: { index: true, follow: true },
};

export default function RoadmapPage() {
  return (
    <>
      <RoadmapContent />
      <SiteFooter />
    </>
  );
}
