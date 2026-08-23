"use client";

import { useEffect } from "react";
import { useGraphStore } from "@/store/useGraphStore";
import { useEditorStore } from "@/store/useEditorStore";
import { useVariableStore } from "@/store/useVariableStore";
import { DEMO_EDGES, DEMO_NODES, DEMO_PROJECT_NAME, DEMO_VARIABLES } from "@/lib/demoProject";

/**
 * Honours the landing page's "Load the demo project" call to action, which
 * arrives as `/editor?demo=1`.
 *
 * Only ever loads onto an empty canvas: someone who already has work in the
 * local draft must not lose it because they followed a marketing link. The
 * parameter is then stripped so a refresh does not re-trigger it.
 */
export function useDemoLaunch() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") !== "1") return;

    if (useGraphStore.getState().nodes.length === 0) {
      useGraphStore.getState().loadGraph(DEMO_NODES, DEMO_EDGES);
      useEditorStore.getState().setProjectName(DEMO_PROJECT_NAME);
      useVariableStore.getState().setVariables(DEMO_VARIABLES);
    }

    params.delete("demo");
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, []);
}
