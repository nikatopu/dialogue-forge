"use client";

import { useEffect } from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { InspectorPanel } from "./InspectorPanel";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { ValidationBar } from "@/components/validation/ValidationBar";
import { PreviewModal } from "@/components/preview/PreviewModal";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { useGraphStore } from "@/store/useGraphStore";
import { useValidationStore } from "@/store/useValidationStore";
import { useEditorStore } from "@/store/useEditorStore";
import { validateGraph } from "@/lib/validate";

export function EditorLayout() {
  const setIssues = useValidationStore((s) => s.setIssues);
  const { previewOpen, setPreviewOpen } = useEditorStore();

  useEffect(() => {
    /* Run validation once on mount */
    const { nodes, edges } = useGraphStore.getState();
    setIssues(validateGraph(nodes, edges));

    /* Re-run whenever the graph changes */
    return useGraphStore.subscribe((state) => {
      setIssues(validateGraph(state.nodes, state.edges));
    });
  }, [setIssues]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <TopBar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <GraphCanvas />
        <InspectorPanel />
      </div>
      <ValidationBar />
      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} />
      <SettingsModal />
    </div>
  );
}
