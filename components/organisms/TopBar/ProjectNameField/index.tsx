"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useEditorStore } from "@/store/useEditorStore";
import style from "./ProjectNameField.module.scss";

export function ProjectNameField() {
  const { projectName, setProjectName } = useEditorStore();
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(projectName);

  function commitName() {
    const trimmed = nameValue.trim();
    setProjectName(trimmed || "Untitled Project");
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        value={nameValue}
        onChange={(e) => setNameValue(e.target.value)}
        onBlur={commitName}
        onKeyDown={(e) => {
          if (e.key === "Enter") commitName();
          if (e.key === "Escape") { setNameValue(projectName); setEditing(false); }
        }}
        autoFocus
        aria-label="Project name"
        className={style.nameEdit}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => { setNameValue(projectName); setEditing(true); }}
      className={style.nameBtn}
    >
      <span className={style.nameBtnText}>{projectName}</span>
      <Pencil size={12} className={style.pencilIcon} />
    </button>
  );
}
