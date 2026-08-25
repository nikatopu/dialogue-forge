"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import cn from "classnames";
import { PanelRail } from "@/components/atoms/PanelRail";
import { TopBar } from "@/components/organisms/TopBar";
import { Sidebar } from "@/components/organisms/Sidebar";
import { InspectorPanel } from "@/components/organisms/InspectorPanel";
import { MobileToolbar } from "@/components/organisms/MobileToolbar";
import { MobileNodeSheet } from "@/components/organisms/MobileNodeSheet";
import { GraphCanvas } from "@/components/organisms/GraphCanvas";
import { ValidationBar } from "@/components/organisms/ValidationBar";
import { PreviewModal } from "@/components/organisms/PreviewModal";
import { SettingsPanel } from "@/components/organisms/SettingsPanel";
import { WhatsNewModal } from "@/components/organisms/WhatsNewModal";
import { VariablesPanel } from "@/components/organisms/VariablesPanel";
import { useGraphStore } from "@/store/useGraphStore";
import { useValidationStore } from "@/store/useValidationStore";
import { useEditorStore } from "@/store/useEditorStore";
import { useVariableStore } from "@/store/useVariableStore";
import { validateGraph } from "@/lib/validate";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useCloudSync } from "@/hooks/useCloudSync";
import { useActivationTracking } from "./useActivationTracking";
import { useDemoLaunch } from "./useDemoLaunch";
import { useProjectStore } from "@/store/useProjectStore";
import style from "./EditorLayout.module.scss";

export function EditorLayout() {
  const setIssues = useValidationStore((s) => s.setIssues);
  const {
    previewOpen, setPreviewOpen, selectedNodeId, selectedEdgeId, setMobileInspectorOpen,
    sidebarOpen, toggleSidebar, inspectorOpen, toggleInspector, setInspectorOpen,
    variablesPanelOpen, setVariablesPanelOpen,
  } = useEditorStore();
  const variables = useVariableStore((s) => s.variables);
  const isMobile = useIsMobile();
  const { initAuth } = useProjectStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useCloudSync();
  useDemoLaunch();
  useActivationTracking();

  useEffect(() => {
    const { nodes, edges } = useGraphStore.getState();
    setIssues(validateGraph(nodes, edges, variables));
    return useGraphStore.subscribe((state) => {
      setIssues(validateGraph(state.nodes, state.edges, variables));
    });
  }, [setIssues, variables]);

  useEffect(() => {
    if (isMobile && selectedNodeId) {
      setMobileInspectorOpen(true);
    }
  }, [isMobile, selectedNodeId, setMobileInspectorOpen]);

  /*
   * Desktop: picking something to inspect pulls the inspector open.
   * Keyed only on the selection — adding `inspectorOpen` to the deps would
   * fight the user, snapping the panel back open the moment they closed it
   * with a node still selected.
   */
  useEffect(() => {
    if (isMobile) return;
    if (selectedNodeId || selectedEdgeId) setInspectorOpen(true);
  }, [isMobile, selectedNodeId, selectedEdgeId, setInspectorOpen]);

  return (
    <div className={style.container}>
      <TopBar />

      <div className={style.body}>
        <Sidebar />
        {!isMobile && (
          <PanelRail side="left" open={sidebarOpen} onToggle={toggleSidebar} label="Sidebar" />
        )}

        <div className={cn(style.canvasWrapper, isMobile && style.mobileOffset)}>
          <GraphCanvas />
        </div>

        {!isMobile && (
          <div className={style.rightGutter}>
            <PanelRail side="right" open={inspectorOpen} onToggle={toggleInspector} label="Inspector" />
            <PanelRail
              side="right"
              open={variablesPanelOpen}
              onToggle={() => setVariablesPanelOpen(!variablesPanelOpen)}
              label="Variables"
            />
          </div>
        )}

        {isMobile ? (
          <>
            <InspectorPanel />
            <VariablesPanel />
          </>
        ) : (
          <motion.div
            className={style.rightDock}
            initial={false}
            animate={{ width: inspectorOpen || variablesPanelOpen ? 300 : 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <InspectorPanel />
            <VariablesPanel />
          </motion.div>
        )}
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
      <WhatsNewModal />
    </div>
  );
}
