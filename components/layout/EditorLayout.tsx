"use client";

import { useEffect } from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { InspectorPanel } from "./InspectorPanel";
import { MobileToolbar } from "./MobileToolbar";
import { MobileNodeSheet } from "./MobileNodeSheet";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { ValidationBar } from "@/components/validation/ValidationBar";
import { PreviewModal } from "@/components/preview/PreviewModal";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { useGraphStore } from "@/store/useGraphStore";
import { useValidationStore } from "@/store/useValidationStore";
import { useEditorStore } from "@/store/useEditorStore";
import { validateGraph } from "@/lib/validate";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useCloudSync } from "@/hooks/useCloudSync";
import { useProjectStore } from "@/store/useProjectStore";
import { cn } from "@/lib/utils";

export function EditorLayout() {
  const setIssues = useValidationStore((s) => s.setIssues);
  const { previewOpen, setPreviewOpen, selectedNodeId, setMobileInspectorOpen } = useEditorStore();
  const isMobile = useIsMobile();
  const { initAuth } = useProjectStore();

  // Initialise auth once on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Cloud autosave (no-op for guests and local-only projects)
  useCloudSync();

  useEffect(() => {
    const { nodes, edges } = useGraphStore.getState();
    setIssues(validateGraph(nodes, edges));
    return useGraphStore.subscribe((state) => {
      setIssues(validateGraph(state.nodes, state.edges));
    });
  }, [setIssues]);

  /* On mobile, auto-open the inspector sheet when a node is selected */
  useEffect(() => {
    if (isMobile && selectedNodeId) {
      setMobileInspectorOpen(true);
    }
  }, [isMobile, selectedNodeId, setMobileInspectorOpen]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <TopBar />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar — desktop: inline panel; mobile: fixed drawer (self-managed) */}
        <Sidebar />

        {/* Canvas — flex-col so GraphCanvas's inner flex-1 has a flex parent to grow against */}
        <div className={cn(
          "flex flex-col flex-1 min-h-0 relative",
          isMobile && "pb-15",
        )}>
          <GraphCanvas />
        </div>

        {/* Inspector — desktop: inline panel; mobile: bottom sheet (self-managed) */}
        <InspectorPanel />
      </div>

      {/* ValidationBar hidden on mobile — MobileToolbar occupies the same bottom area */}
      {!isMobile && <ValidationBar />}

      {/* Mobile-only overlays */}
      {isMobile && (
        <>
          <MobileToolbar />
          <MobileNodeSheet />
        </>
      )}

      {/* Modals */}
      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} />
      <SettingsPanel />
    </div>
  );
}
