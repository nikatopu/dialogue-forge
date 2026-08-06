"use client";

import { useState, useEffect, useRef } from "react";
import { useGraphStore } from "@/store/useGraphStore";
import { useShallow } from "zustand/react/shallow";
import { DialogueVariableEditor } from "@/components/organisms/DialogueVariableEditor";
import type { CharacterNodeData } from "@/types";
import { InlineInput } from "../InlineInput";
import fields from "../fields.module.scss";

type CharacterPropertiesProps = {
  nodeId: string;
  data: CharacterNodeData;
  onUpdate: (p: Partial<CharacterNodeData>) => void;
};

export function CharacterProperties({ nodeId, data, onUpdate }: CharacterPropertiesProps) {
  const characterNames = useGraphStore(
    useShallow((s) => s.nodes
      .filter((n) => n.type === "character" && n.id !== nodeId)
      .map((n) => (n.data as CharacterNodeData).name)
      .filter(Boolean)
      .filter((name, i, arr) => arr.indexOf(name) === i)),
  );
  const [localDialogue, setLocalDialogue] = useState(data.dialogue);
  const dialogueDirty = useRef(false);

  useEffect(() => {
    if (!dialogueDirty.current) setLocalDialogue(data.dialogue);
  }, [data.dialogue]);

  function handleDialogueChange(v: string) {
    dialogueDirty.current = true;
    setLocalDialogue(v);
    onUpdate({ dialogue: v });
  }

  return (
    <>
      <div className={fields.field}>
        <p className={fields.fieldLabel}>Name</p>
        <InlineInput value={data.name} placeholder="Character name" suggestions={characterNames} onCommit={(v) => onUpdate({ name: v })} />
      </div>
      <div className={fields.field}>
        <p className={fields.fieldLabel}>Dialogue</p>
        <DialogueVariableEditor
          value={localDialogue}
          onChange={handleDialogueChange}
          placeholder="What does this character say?"
          rows={4}
        />
      </div>
      <div className={fields.field}>
        <p className={fields.fieldLabel}>Emotion</p>
        <InlineInput value={data.emotion ?? ""} placeholder="e.g. Happy, Sad, Angry" onCommit={(v) => onUpdate({ emotion: v })} />
      </div>
      <div className={fields.field}>
        <p className={fields.fieldLabel}>Portrait URL</p>
        <InlineInput value={data.portrait ?? ""} placeholder="https://…" onCommit={(v) => onUpdate({ portrait: v })} />
      </div>
    </>
  );
}
