"use client";

import { Plus, PanelLeft, Search, Play, Layers, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useEditorStore } from "@/store/useEditorStore";
import cn from "classnames";
import style from "./MobileToolbar.module.scss";

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
    searchOpen,
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
      onClick: () => setSearchOpen(!searchOpen),
    },
    {
      icon: Plus,
      label: "Add",
      onClick: () => setNodeSheetOpen(true),
      primary: true,
    },
    { icon: Play, label: "Preview", onClick: () => setPreviewOpen(true) },
    {
      icon: Layers,
      label: "Inspector",
      onClick: () => setMobileInspectorOpen(!mobileInspectorOpen),
      active: mobileInspectorOpen && !!selectedNodeId,
    },
    { icon: Settings, label: "Settings", onClick: () => setSettingsOpen(true) },
  ];

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 36, delay: 0.1 }}
      className={style.toolbar}
    >
      <div className={style.content}>
        {buttons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.label}
              type="button"
              onClick={btn.onClick}
              className={cn(
                style.btn,
                btn.primary && style.btnPrimary,
                btn.active && style.btnActive,
              )}
            >
              <Icon size={btn.primary ? 22 : 20} />
              <span className={style.label}>{btn.label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
