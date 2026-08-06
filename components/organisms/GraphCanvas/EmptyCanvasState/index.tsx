"use client";

import { Network, Mouse, Sparkles } from "lucide-react";
import { useGraphStore } from "@/store/useGraphStore";
import { useEditorStore } from "@/store/useEditorStore";
import { useVariableStore } from "@/store/useVariableStore";
import { DEMO_NODES, DEMO_EDGES, DEMO_PROJECT_NAME, DEMO_VARIABLES } from "@/lib/demoProject";
import style from "./EmptyCanvasState.module.scss";

function KbdHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className={style.hintItem}>
      {keys.map((k) => <kbd key={k} className={style.hintKbd}>{k}</kbd>)}
      <span className={style.hintLabel}>{label}</span>
    </span>
  );
}

export function EmptyCanvasState() {
  const { loadGraph } = useGraphStore();
  const { setProjectName } = useEditorStore();
  const { setVariables } = useVariableStore();

  return (
    <div className={style.emptyState}>
      <div className={style.emptyInner}>
        <div className={style.emptyIconWrap}>
          <div className={style.emptyIconBox}>
            <Network size={32} className={style.emptyIconGlyph} />
          </div>
          <div className={style.emptyIconPing} />
        </div>

        <p className={style.emptyTitle}>Your canvas is empty</p>
        <p className={style.emptyDesc}>
          Drag a <span className={style.startWord}>Start</span>,{" "}
          <span className={style.characterWord}>Character</span>, or{" "}
          <span className={style.actionWord}>Action</span> node from the sidebar to begin
        </p>

        <button
          type="button"
          onClick={() => { loadGraph(DEMO_NODES, DEMO_EDGES); setProjectName(DEMO_PROJECT_NAME); setVariables(DEMO_VARIABLES); }}
          className={style.demoBtn}
        >
          <Sparkles size={14} />
          Load demo project
        </button>

        <div className={style.hints}>
          <span className={style.hintItem}><Mouse size={12} />Scroll to zoom</span>
          <span className={style.hintSep}>·</span>
          <KbdHint keys={["Space"]} label="pan" />
          <span className={style.hintSep}>·</span>
          <KbdHint keys={["Shift"]} label="multi-select" />
          <span className={style.hintSep}>·</span>
          <KbdHint keys={["Del"]} label="delete" />
          <span className={style.hintSep}>·</span>
          <KbdHint keys={["Ctrl", "D"]} label="duplicate" />
          <span className={style.hintSep}>·</span>
          <KbdHint keys={["Ctrl", "Z"]} label="undo" />
        </div>
      </div>
    </div>
  );
}
