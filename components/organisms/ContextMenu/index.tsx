"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Copy, Trash2, Layers, ClipboardCopy } from "lucide-react";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import cn from "classnames";
import style from "./ContextMenu.module.scss";

export function ContextMenu() {
  const { contextMenu, setContextMenu, setSelectedNodeId } = useEditorStore();
  const { removeNode, duplicateNode, copySelected } = useGraphStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contextMenu) return;

    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setContextMenu(null);
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
      icon: Layers, label: "Inspect", shortcut: null,
      action() { setSelectedNodeId(nodeId); setContextMenu(null); },
    },
    {
      icon: Copy, label: "Duplicate", shortcut: "Ctrl+D",
      action() { duplicateNode(nodeId); setContextMenu(null); },
    },
    {
      icon: ClipboardCopy, label: "Copy", shortcut: "Ctrl+C",
      action() { copySelected([nodeId]); setContextMenu(null); },
    },
    null,
    {
      icon: Trash2, label: "Delete", shortcut: "Del", danger: true,
      action() { removeNode(nodeId); setSelectedNodeId(null); setContextMenu(null); },
    },
  ] as const;

  return createPortal(
    <div ref={ref} style={{ top: y, left: x }} className={style.menu}>
      {items.map((item, i) =>
        item === null ? (
          <div key={i} className={style.divider} />
        ) : (
          <button
            key={item.label}
            type="button"
            onClick={item.action}
            className={cn(style.item, "danger" in item && item.danger && style.itemDanger)}
          >
            <item.icon size={14} className={style.itemIcon} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.shortcut && <span className={style.shortcut}>{item.shortcut}</span>}
          </button>
        ),
      )}
    </div>,
    document.body,
  );
}
