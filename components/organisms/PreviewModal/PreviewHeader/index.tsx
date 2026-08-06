"use client";

import { X, ChevronRight, ChevronLeft, RotateCcw, SlidersHorizontal } from "lucide-react";
import cn from "classnames";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import type { Phase } from "../previewHelpers";
import style from "./PreviewHeader.module.scss";

type PreviewHeaderProps = {
  phase: Phase;
  stepNumber: number | null;
  showBack: boolean;
  showRestart: boolean;
  showStateToggle: boolean;
  statePanelOpen: boolean;
  onBack: () => void;
  onRestart: () => void;
  onToggleState: () => void;
  onClose: () => void;
};

const TITLES: Record<Phase, string> = {
  entry: "Choose Entry Point",
  setup: "Set Initial Values",
  playing: "Preview",
};

export function PreviewHeader({
  phase, stepNumber, showBack, showRestart, showStateToggle, statePanelOpen,
  onBack, onRestart, onToggleState, onClose,
}: PreviewHeaderProps) {
  return (
    <div className={style.header}>
      <div className={style.headerLeft}>
        <div className={style.headerIconBox}><ChevronRight size={12} className={style.headerIconGlyph} /></div>
        <span className={style.headerTitle}>{TITLES[phase]}</span>
        {stepNumber !== null && (
          <Badge variant="secondary" className={style.stepBadge}>step {stepNumber}</Badge>
        )}
      </div>
      <div className={style.headerRight}>
        {showBack && (
          <Button variant="ghost" size="icon-sm" onClick={onBack} className={style.iconBtn} aria-label="Back">
            <ChevronLeft size={14} />
          </Button>
        )}
        {showRestart && (
          <Button variant="ghost" size="icon-sm" onClick={onRestart} className={style.iconBtn} aria-label="Restart">
            <RotateCcw size={14} />
          </Button>
        )}
        {showStateToggle && (
          <Button
            variant="ghost" size="icon-sm" onClick={onToggleState}
            className={cn(style.iconBtn, statePanelOpen && style.iconBtnActive)}
            aria-label="Variable state"
          >
            <SlidersHorizontal size={14} />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" onClick={onClose} className={style.iconBtn} aria-label="Close preview">
          <X size={14} />
        </Button>
      </div>
    </div>
  );
}
