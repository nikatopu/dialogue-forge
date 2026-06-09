"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme, AutosaveStatus } from "@/types";

interface ContextMenuState {
  x: number;
  y: number;
  nodeId: string;
}

interface EditorStore {
  /* UI state */
  sidebarOpen: boolean;
  inspectorOpen: boolean;
  selectedNodeId: string | null;
  projectName: string;
  theme: Theme;
  contextMenu: ContextMenuState | null;
  previewOpen: boolean;
  searchOpen: boolean;
  settingsOpen: boolean;
  pickingJumpFor: string | null;
  /** Mobile: bottom sheet for creating new nodes */
  nodeSheetOpen: boolean;
  /** Mobile: whether the inspector bottom sheet is open */
  mobileInspectorOpen: boolean;
  /** Cloud: ID of the currently open cloud project (null = local draft) */
  currentProjectId: string | null;
  /** Cloud: autosave status indicator */
  autosaveStatus: AutosaveStatus;
  /** Currently selected edge ID (for edge inspector) */
  selectedEdgeId: string | null;
  /** Whether the Variables panel overlay is open */
  variablesPanelOpen: boolean;

  /* Actions */
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setInspectorOpen: (open: boolean) => void;
  toggleInspector: () => void;
  setSelectedNodeId: (id: string | null) => void;
  setProjectName: (name: string) => void;
  setTheme: (theme: Theme) => void;
  setContextMenu: (menu: ContextMenuState | null) => void;
  setPreviewOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setPickingJumpFor: (id: string | null) => void;
  setNodeSheetOpen: (open: boolean) => void;
  setMobileInspectorOpen: (open: boolean) => void;
  setCurrentProjectId: (id: string | null) => void;
  setAutosaveStatus: (status: AutosaveStatus) => void;
  setSelectedEdgeId: (id: string | null) => void;
  setVariablesPanelOpen: (open: boolean) => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      inspectorOpen: true,
      selectedNodeId: null,
      projectName: "Untitled Project",
      theme: "default",
      contextMenu: null,
      previewOpen: false,
      searchOpen: false,
      settingsOpen: false,
      pickingJumpFor: null,
      nodeSheetOpen: false,
      mobileInspectorOpen: false,
      currentProjectId: null,
      autosaveStatus: "idle",
      selectedEdgeId: null,
      variablesPanelOpen: false,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setInspectorOpen: (open) => set({ inspectorOpen: open }),
      toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
      setSelectedNodeId: (id) => set({ selectedNodeId: id }),
      setProjectName: (name) => set({ projectName: name }),
      setTheme: (theme) => set({ theme }),
      setContextMenu: (menu) => set({ contextMenu: menu }),
      setPreviewOpen: (open) => set({ previewOpen: open }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      setPickingJumpFor: (id) => set({ pickingJumpFor: id }),
      setNodeSheetOpen: (open) => set({ nodeSheetOpen: open }),
      setMobileInspectorOpen: (open) => set({ mobileInspectorOpen: open }),
      setCurrentProjectId: (id) => set({ currentProjectId: id }),
      setAutosaveStatus: (status) => set({ autosaveStatus: status }),
      setSelectedEdgeId: (id) => set({ selectedEdgeId: id }),
      setVariablesPanelOpen: (open) => set({ variablesPanelOpen: open }),
    }),
    {
      name: "dialogue-forge-ui",
      version: 2,
      migrate: (persisted, version) => {
        const s = persisted as Record<string, unknown>;
        if (version < 2 && (s.theme === "dark" || s.theme === "light" || !s.theme)) {
          s.theme = "default";
        }
        return s;
      },
      partialize: (s) => ({
        sidebarOpen: s.sidebarOpen,
        inspectorOpen: s.inspectorOpen,
        projectName: s.projectName,
        theme: s.theme,
      }),
    }
  )
);
