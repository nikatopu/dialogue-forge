"use client";

import { useEffect, useRef } from "react";
import { projectService } from "@/lib/services/projectService";
import { analyticsService } from "@/lib/analytics/analyticsService";
import { useGraphStore } from "@/store/useGraphStore";
import { useEditorStore } from "@/store/useEditorStore";
import { useProjectStore } from "@/store/useProjectStore";

const DEBOUNCE_MS = 3500;

/**
 * Subscribes to graph/name changes and debounce-saves to Supabase
 * when the user is signed in and has a currentProjectId.
 *
 * Guest users (no projectId) are unaffected — localStorage handles them.
 */
export function useCloudSync() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useProjectStore();
  const { currentProjectId, setAutosaveStatus } = useEditorStore();

  useEffect(() => {
    // Only sync when signed in and working on a cloud project
    if (!user || !currentProjectId) return;

    const projectId = currentProjectId; // capture non-null for closure

    function scheduleSync() {
      if (timerRef.current) clearTimeout(timerRef.current);

      setAutosaveStatus("saving");

      timerRef.current = setTimeout(async () => {
        const { nodes, edges } = useGraphStore.getState();
        const { projectName } = useEditorStore.getState();

        try {
          if (!navigator.onLine) {
            setAutosaveStatus("offline");
            return;
          }

          await projectService.saveGraph(
            projectId,
            { nodes, edges } as unknown as import("@/types").CloudProject["graph"],
            projectName,
          );

          setAutosaveStatus("saved");
          analyticsService.track("project_cloud_saved");

          // Reset to idle after 2s
          setTimeout(() => setAutosaveStatus("idle"), 2000);
        } catch {
          setAutosaveStatus("error");
        }
      }, DEBOUNCE_MS);
    }

    // Subscribe to graph changes
    const unsubGraph = useGraphStore.subscribe(scheduleSync);

    // Subscribe to editor store changes and trigger sync when projectName changes
    let prevName = useEditorStore.getState().projectName;
    const unsubEditor = useEditorStore.subscribe((state) => {
      if (state.projectName !== prevName) {
        prevName = state.projectName;
        scheduleSync();
      }
    });

    return () => {
      unsubGraph();
      unsubEditor();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, currentProjectId, setAutosaveStatus]);
}
