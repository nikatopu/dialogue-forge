"use client";

import { Zap } from "lucide-react";
import { Separator } from "@/components/atoms/Separator";
import type { ActionNodeData, TriggerExecutionMode } from "@/types";
import { EXECUTION_DESCRIPTIONS, EXECUTION_MODES } from "../../nodeInspectorConfig";
import { InlineInput } from "../../InlineInput";
import { ParamsEditor } from "../ParamsEditor";
import fields from "../../fields.module.scss";
import style from "./TriggerSection.module.scss";

type TriggerSectionProps = {
  data: ActionNodeData;
  onUpdate: (p: Partial<ActionNodeData>) => void;
};

/**
 * A Trigger node does exactly one thing: emit a single custom event to the
 * host runtime. The event name is author-defined — Dialogue Forge never
 * interprets it, it only passes it through on export and in preview.
 */
export function TriggerSection({ data, onUpdate }: TriggerSectionProps) {
  const event = data.event ?? "";
  const params = data.params ?? {};
  const paramKeys = Object.keys(params).filter((k) => k.trim() !== "");

  return (
    <>
      <Separator className={style.separator} />

      <div className={fields.field}>
        <p className={fields.fieldLabel}>Event Name</p>
        <InlineInput
          value={event}
          placeholder="e.g. QuestStarted"
          onCommit={(v) => onUpdate({ event: v })}
        />
        <p className={style.hint}>
          The event your game engine listens for. Names are passed through
          untouched — use whatever your runtime expects.
        </p>
      </div>

      <div className={fields.field}>
        <p className={fields.fieldLabel}>Emits</p>
        <div className={style.signature}>
          <Zap size={11} className={style.signatureIcon} />
          <code className={style.signatureCode}>
            {event.trim() || <span className={style.signatureEmpty}>unnamed</span>}
            {"("}{paramKeys.join(", ")}{")"}
          </code>
        </div>
      </div>

      <div className={fields.field}>
        <p className={fields.fieldLabel}>Execution Mode</p>
        <select
          value={data.executionMode ?? "immediate"}
          onChange={(e) => onUpdate({ executionMode: e.target.value as TriggerExecutionMode })}
          aria-label="Execution mode"
          className={fields.select}
        >
          {EXECUTION_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <p className={style.executionNote}>{EXECUTION_DESCRIPTIONS[data.executionMode ?? "immediate"]}</p>
      </div>

      <ParamsEditor params={params} onUpdate={(p) => onUpdate({ params: p })} />
    </>
  );
}
