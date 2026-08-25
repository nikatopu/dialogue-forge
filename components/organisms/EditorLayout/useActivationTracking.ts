"use client";

import { useEffect } from "react";
import { useGraphStore } from "@/store/useGraphStore";
import { useEditorStore } from "@/store/useEditorStore";
import { trackOnce, trackSessionOnce } from "@/lib/analytics";
import { widestBranch } from "@/lib/analytics/funnel";

/**
 * The two funnel events that describe reaching the editor, rather than
 * clicking something in it.
 *
 * `demo_loaded` marks the first time the editor is reached in a session, from
 * either `/editor` or a cloud project. `first_branch_created` cannot be read
 * off a single interaction — a branch qualifies once a Branch node has a second
 * outgoing edge, which may happen via a drag, a paste, an undo or an import —
 * so it is derived from the graph itself.
 */
export function useActivationTracking() {
  useEffect(() => {
    const { nodes } = useGraphStore.getState();
    const { currentProjectId } = useEditorStore.getState();

    trackSessionOnce("demo_loaded", {
      surface: currentProjectId ? "cloud" : "local",
      node_count: nodes.length,
    });
  }, []);

  useEffect(() => {
    const check = (nodes = useGraphStore.getState().nodes, edges = useGraphStore.getState().edges) => {
      const width = widestBranch(nodes, edges);
      if (width >= 2) {
        trackOnce("first_branch_created", { outgoing_edges: width });
      }
    };

    check();

    // `trackOnce` is a no-op after the milestone is claimed, so leaving the
    // subscription in place for the session costs one cheap scan per change.
    return useGraphStore.subscribe((state) => check(state.nodes, state.edges));
  }, []);
}
