"use client";

import {
  Plus,
  PanelLeft,
  Search,
  Play,
  Layers,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEditorStore } from "@/store/useEditorStore";
import { cn } from "@/lib/utils";

interface ToolBtn {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  primary?: boolean;
  active?: boolean;
}

export function MobileToolbar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    mobileInspectorOpen,
    setMobileInspectorOpen,
    setNodeSheetOpen,
    setPreviewOpen,
    setSearchOpen,
    setSettingsOpen,
    selectedNodeId,
  } = useEditorStore();

  const buttons: ToolBtn[] = [
    {
      icon: PanelLeft,
      label: "Nodes",
      onClick: () => setSidebarOpen(!sidebarOpen),
      active: sidebarOpen,
    },
    {
      icon: Search,
      label: "Search",
      onClick: () => setSearchOpen(true),
    },
    {
      icon: Plus,
      label: "Add",
      onClick: () => setNodeSheetOpen(true),
      primary: true,
    },
    {
      icon: Play,
      label: "Preview",
      onClick: () => setPreviewOpen(true),
    },
    {
      icon: Layers,
      label: "Inspector",
      onClick: () => setMobileInspectorOpen(!mobileInspectorOpen),
      active: mobileInspectorOpen && !!selectedNodeId,
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => setSettingsOpen(true),
    },
  ];

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 36, delay: 0.1 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30",
        "bg-card/90 backdrop-blur-xl border-t border-border/60",
        "pb-safe", // respects iOS safe area via Tailwind plugin or custom CSS
      )}
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.label}
              type="button"
              onClick={btn.onClick}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-100 min-w-[44px] min-h-[44px] justify-center",
                btn.primary
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                  : btn.active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground active:bg-muted/50",
              )}
            >
              <Icon className={cn("w-5 h-5", btn.primary && "w-5.5 h-5.5")} />
              <span className="text-[10px] font-medium leading-none">{btn.label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
