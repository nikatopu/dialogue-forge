"use client";

import { useEffect } from "react";
import cn from "classnames";
import { TopBar } from "@/components/organisms/TopBar";
import { Sidebar } from "@/components/organisms/Sidebar";
import { InspectorPanel } from "@/components/organisms/InspectorPanel";
import { MobileToolbar } from "@/components/organisms/MobileToolbar";
import { MobileNodeSheet } from "@/components/organisms/MobileNodeSheet";
import { GraphCanvas } from "@/components/organisms/GraphCanvas";
import { ValidationBar } from "@/components/organisms/ValidationBar";
import { PreviewModal } from "@/components/organisms/PreviewModal";
import { SettingsPanel } from "@/components/organisms/SettingsPanel";
import { useGraphStore } from "@/store/useGraphStore";
import { useValidationStore } from "@/store/useValidationStore";
import { useEditorStore } from "@/store/useEditorStore";
import { validateGraph } from "@/lib/validate";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useCloudSync } from "@/hooks/useCloudSync";
import { useProjectStore } from "@/store/useProjectStore";
import style from "./EditorLayout.module.scss";

export function EditorLayout() {
  const setIssues = useValidationStore((s) => s.setIssues);
  const { previewOpen, setPreviewOpen, selectedNodeId, setMobileInspectorOpen } = useEditorStore();
  const isMobile = useIsMobile();
  const { initAuth } = useProjectStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useCloudSync();

  useEffect(() => {
    const { nodes, edges } = useGraphStore.getState();
    setIssues(validateGraph(nodes, edges));
    return useGraphStore.subscribe((state) => {
      setIssues(validateGraph(state.nodes, state.edges));
    });
  }, [setIssues]);

  useEffect(() => {
    if (isMobile && selectedNodeId) {
      setMobileInspectorOpen(true);
    }
  }, [isMobile, selectedNodeId, setMobileInspectorOpen]);

  return (
    <div className={style.container}>
      <TopBar />

      <div className={style.body}>
        <Sidebar />

        <div className={cn(style.canvasWrapper, isMobile && style.mobileOffset)}>
          <GraphCanvas />
        </div>

        <InspectorPanel />
      </div>

      {!isMobile && <ValidationBar />}

      {isMobile && (
        <>
          <MobileToolbar />
          <MobileNodeSheet />
        </>
      )}

      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} />
      <SettingsPanel />
    </div>
  );
}
