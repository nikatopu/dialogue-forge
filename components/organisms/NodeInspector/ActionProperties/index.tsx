"use client";

import type { ActionNodeData, ActionType } from "@/types";
import { ACTION_TYPES } from "../nodeInspectorConfig";
import { InlineInput } from "../InlineInput";
import { TriggerSection } from "./TriggerSection";
import { BranchOptionsSection } from "./BranchOptionsSection";
import { JumpTargetSection } from "./JumpTargetSection";
import { VariableActionSection } from "./VariableActionSection";
import fields from "../fields.module.scss";

type ActionPropertiesProps = {
  nodeId: string;
  data: ActionNodeData;
  onUpdate: (p: Partial<ActionNodeData>) => void;
};

export function ActionProperties({ nodeId, data, onUpdate }: ActionPropertiesProps) {
  return (
    <>
      <div className={fields.field}>
        <p className={fields.fieldLabel}>Label</p>
        <InlineInput value={data.label} placeholder="Action label" onCommit={(v) => onUpdate({ label: v })} />
      </div>
      <div className={fields.field}>
        <p className={fields.fieldLabel}>Action Type</p>
        <select value={data.actionType} onChange={(e) => onUpdate({ actionType: e.target.value as ActionType })} aria-label="Action type" className={fields.select}>
          {ACTION_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>
      {data.actionType === "trigger" && <TriggerSection data={data} onUpdate={onUpdate} />}
      {data.actionType === "branch" && <BranchOptionsSection nodeId={nodeId} />}
      {data.actionType === "jump" && <JumpTargetSection nodeId={nodeId} />}
      {data.actionType === "setVariable" && <VariableActionSection data={data} onUpdate={onUpdate} />}
    </>
  );
}
