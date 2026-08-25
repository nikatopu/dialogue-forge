import type { AnalyticsEventName } from "@/lib/analytics";

/** The walkthrough the capture view checks off, in the order a user hits it. */
export const FUNNEL_STEPS: { event: AnalyticsEventName; how: string }[] = [
  { event: "landing_view",         how: "Open / — the marketing page." },
  { event: "return_visit",         how: "Reload after 30 minutes, or hit “Reset funnel state”, close the tab and return." },
  { event: "demo_loaded",          how: "Open /editor, or follow “Open the editor”." },
  { event: "project_created",      how: "Drop the first node on an empty canvas, import a file, or create a cloud project." },
  { event: "first_node_added",     how: "Drag any node from the sidebar onto the canvas." },
  { event: "first_branch_created", how: "Add a Branch action node and connect two outgoing edges to it." },
  { event: "preview_run",          how: "Press Preview in the toolbar." },
  { event: "export_clicked",       how: "Use More › Export JSON, or the Save button." },
];
