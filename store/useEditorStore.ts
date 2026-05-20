"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme } from "@/types";

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
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      inspectorOpen: true,
      selectedNodeId: null,
      projectName: "Untitled Project",
      theme: "dark",
      contextMenu: null,
      previewOpen: false,
      searchOpen: false,
      settingsOpen: false,

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
    }),
    {
      name: "dialogue-forge-ui",
      partialize: (s) => ({
        sidebarOpen: s.sidebarOpen,
        inspectorOpen: s.inspectorOpen,
        projectName: s.projectName,
        theme: s.theme,
      }),
    }
  )
);
