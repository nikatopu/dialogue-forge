"use client";

import { useEffect, useRef } from "react";
import { projectService } from "@/lib/services/projectService";
import { analyticsService } from "@/lib/analytics/analyticsService";
import { useGraphStore } from "@/store/useGraphStore";
import { useEditorStore } from "@/store/useEditorStore";
import { useProjectStore } from "@/store/useProjectStore";
import { toast } from "@/lib/toast";

const DEBOUNCE_MS = 3000;

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
    if (!user || !currentProjectId) return;

    const projectId = currentProjectId;
    let pendingSave = false;

    function scheduleSync() {
      if (timerRef.current) clearTimeout(timerRef.current);

      setAutosaveStatus("saving");

      timerRef.current = setTimeout(async () => {
        if (pendingSave) return; // prevent duplicate in-flight writes
        pendingSave = true;

        const { nodes, edges } = useGraphStore.getState();
        const { projectName } = useEditorStore.getState();

        try {
          if (!navigator.onLine) {
            setAutosaveStatus("offline");
            pendingSave = false;
            return;
          }

          await projectService.saveGraph(
            projectId,
            { nodes, edges } as unknown as import("@/types").CloudProject["graph"],
            projectName,
          );

          setAutosaveStatus("saved");
          analyticsService.track("project_cloud_saved");

          setTimeout(() => setAutosaveStatus("idle"), 2000);
        } catch (err) {
          setAutosaveStatus("error");
          const msg = err instanceof Error ? err.message : "";
          if (!navigator.onLine) {
            toast.warning("Offline — changes will sync when reconnected.");
          } else if (msg.toLowerCase().includes("auth") || msg.toLowerCase().includes("jwt")) {
            toast.error("Session expired. Sign in again to continue saving.");
          } else {
            toast.error("Autosave failed. Check your connection.");
          }
        } finally {
          pendingSave = false;
        }
      }, DEBOUNCE_MS);
    }

    const unsubGraph = useGraphStore.subscribe(scheduleSync);

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
