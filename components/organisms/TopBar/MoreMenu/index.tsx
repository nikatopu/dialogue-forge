"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  Upload,
  Download,
  Map,
  BookOpen,
  Settings,
  Keyboard,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/atoms/Tooltip";
import { MenuItem } from "./MenuItem";
import style from "./MoreMenu.module.scss";

type MoreMenuProps = {
  onImport: () => void;
  onExport: () => void;
  onSettings: () => void;
  onClearWorkspace: () => void;
  nodesCount: number;
};

export function MoreMenu({
  onImport,
  onExport,
  onSettings,
  onClearWorkspace,
  nodesCount,
}: MoreMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className={style.moreWrapper}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen((v) => !v)}
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </Button>
        </TooltipTrigger>
        {!open && <TooltipContent side="bottom">More options</TooltipContent>}
      </Tooltip>

      {open && (
        <div className={style.dropdown}>
          <MenuItem
            icon={Upload}
            label="Import JSON"
            onClick={() => {
              onImport();
              setOpen(false);
            }}
          />
          <MenuItem
            icon={Download}
            label="Export JSON"
            onClick={() => {
              onExport();
              setOpen(false);
            }}
          />
          <div className={style.menuDivider} />
          <MenuItem
            icon={Map}
            label="Roadmap"
            href="/roadmap"
            onClick={() => setOpen(false)}
          />
          <MenuItem
            icon={BookOpen}
            label="How to use"
            href="/how-to-use"
            onClick={() => setOpen(false)}
          />
          <div className={style.menuDivider} />
          <MenuItem
            icon={Settings}
            label="Settings"
            onClick={() => {
              onSettings();
              setOpen(false);
            }}
          />
          <div className={style.menuDivider} />
          <MenuItem
            icon={Trash2}
            label="Clear workspace"
            onClick={() => {
              onClearWorkspace();
              setOpen(false);
            }}
            destructive
            disabled={nodesCount === 0}
          />
        </div>
      )}
    </div>
  );
}
