"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Copy, Trash2, Layers, ClipboardCopy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";

export function ContextMenu() {
  const { contextMenu, setContextMenu, setSelectedNodeId } = useEditorStore();
  const { removeNode, duplicateNode, copySelected } = useGraphStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contextMenu) return;

    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setContextMenu(null);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [contextMenu, setContextMenu]);

  if (!contextMenu) return null;

  const { x, y, nodeId } = contextMenu;

  const items = [
    {
      icon: Layers,
      label: "Inspect",
      shortcut: null,
      action() {
        setSelectedNodeId(nodeId);
        setContextMenu(null);
      },
    },
    {
      icon: Copy,
      label: "Duplicate",
      shortcut: "Ctrl+D",
      action() {
        duplicateNode(nodeId);
        setContextMenu(null);
      },
    },
    {
      icon: ClipboardCopy,
      label: "Copy",
      shortcut: "Ctrl+C",
      action() {
        copySelected([nodeId]);
        setContextMenu(null);
      },
    },
    null, // separator
    {
      icon: Trash2,
      label: "Delete",
      shortcut: "Del",
      danger: true,
      action() {
        removeNode(nodeId);
        setSelectedNodeId(null);
        setContextMenu(null);
      },
    },
  ] as const;

  return createPortal(
    <div
      ref={ref}
      style={{ top: y, left: x }}
      className={cn(
        "fixed z-[9999] min-w-40 rounded-xl overflow-hidden",
        "border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl",
        "py-1 select-none"
      )}
    >
      {items.map((item, i) =>
        item === null ? (
          <div key={i} className="mx-2 my-1 border-t border-border/40" />
        ) : (
          <button
            key={item.label}
            type="button"
            onClick={item.action}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-1.5 text-xs",
              "transition-colors text-left",
              "danger" in item && item.danger
                ? "text-destructive hover:bg-destructive/10"
                : "text-foreground hover:bg-muted/50"
            )}
          >
            <item.icon className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-[10px] text-muted-foreground/50 font-mono">
                {item.shortcut}
              </span>
            )}
          </button>
        )
      )}
    </div>,
    document.body
  );
}
