"use client";

import cn from "classnames";
import type { StartNodeData } from "@/types";
import { InlineInput } from "../InlineInput";
import fields from "../fields.module.scss";
import style from "./StartNodeProperties.module.scss";

type StartNodePropertiesProps = {
  data: StartNodeData;
  onUpdate: (p: Partial<StartNodeData>) => void;
};

export function StartNodeProperties({ data, onUpdate }: StartNodePropertiesProps) {
  return (
    <div className={fields.field}>
      <p className={fields.fieldLabel}>Entry Name</p>
      <InlineInput value={data.name} placeholder="e.g. Main Story, Combat" onCommit={(v) => onUpdate({ name: v })} />
      <p className={cn(fields.emptyNote, style.note)}>
        Start nodes are entry points for your dialogue graph. Connect outgoing edges to begin the flow.
      </p>
    </div>
  );
}
