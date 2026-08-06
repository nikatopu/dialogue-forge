"use client";

import cn from "classnames";
import { Separator } from "@/components/atoms/Separator";
import { TRIGGER_EVENTS } from "@/types";
import type { ActionNodeData, TriggerExecutionMode } from "@/types";
import {
  CATEGORY_ICONS, CATEGORY_COLORS, EXECUTION_DESCRIPTIONS, ALL_CATEGORIES,
} from "../../nodeInspectorConfig";
import { InlineInput } from "../../InlineInput";
import { ParamsEditor } from "../ParamsEditor";
import fields from "../../fields.module.scss";
import style from "./TriggerSection.module.scss";

type TriggerSectionProps = {
  data: ActionNodeData;
  onUpdate: (p: Partial<ActionNodeData>) => void;
};

export function TriggerSection({ data, onUpdate }: TriggerSectionProps) {
  const category = data.category ?? "custom";
  const CategoryIcon = CATEGORY_ICONS[category];
  const events = TRIGGER_EVENTS[category];
  return (
    <>
      <Separator className={style.separator} />
      <div className={fields.field}>
        <p className={fields.fieldLabel}>Category</p>
        <div className={style.categoryGrid}>
          {ALL_CATEGORIES.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat];
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onUpdate({ category: cat, event: "", params: {} })}
                className={cn(style.categoryBtn, isSelected && style.categoryBtnActive)}
                style={isSelected ? { color: CATEGORY_COLORS[cat], borderColor: `color-mix(in oklch, ${CATEGORY_COLORS[cat]} 30%, transparent)` } : {}}
              >
                <CatIcon size={12} />{cat}
              </button>
            );
          })}
        </div>
        <div className={style.categoryInfo} style={{ color: CATEGORY_COLORS[category] }}>
          <CategoryIcon size={12} /><span>{category}</span>
        </div>
      </div>
      <div className={fields.field}>
        <p className={fields.fieldLabel}>Event</p>
        {category === "custom"
          ? <InlineInput value={data.event ?? ""} placeholder="Custom event name" onCommit={(v) => onUpdate({ event: v })} />
          : (
            <select value={data.event ?? ""} onChange={(e) => onUpdate({ event: e.target.value })} aria-label="Trigger event" className={fields.select}>
              <option value="">— select event —</option>
              {events.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
            </select>
          )
        }
      </div>
      <div className={fields.field}>
        <p className={fields.fieldLabel}>Execution Mode</p>
        <select value={data.executionMode ?? "immediate"} onChange={(e) => onUpdate({ executionMode: e.target.value as TriggerExecutionMode })} aria-label="Execution mode" className={fields.select}>
          <option value="immediate">Immediate</option>
          <option value="beforeNext">Before Next</option>
          <option value="afterNext">After Next</option>
        </select>
        <p className={style.executionNote}>{EXECUTION_DESCRIPTIONS[data.executionMode ?? "immediate"]}</p>
      </div>
      <ParamsEditor params={data.params ?? {}} onUpdate={(params) => onUpdate({ params })} />
    </>
  );
}
