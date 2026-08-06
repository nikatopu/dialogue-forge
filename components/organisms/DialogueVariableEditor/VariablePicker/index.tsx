"use client";

import { TypeBadge } from "@/components/atoms/TypeBadge";
import type { ProjectVariable } from "@/types";
import style from "./VariablePicker.module.scss";

type VariablePickerProps = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  search: string;
  onSearchChange: (v: string) => void;
  items: ProjectVariable[];
  onSelect: (name: string) => void;
};

export function VariablePicker({ open, onToggle, onClose, search, onSearchChange, items, onSelect }: VariablePickerProps) {
  return (
    <div className={style.toolbar}>
      <div className={style.anchor}>
        <button type="button" className={style.insertBtn} onClick={onToggle}>
          {"{x}"} Insert Variable
        </button>

        {open && (
          <>
            <div className={style.pickerOverlay} onClick={onClose} />
            <div className={style.picker}>
              <div className={style.pickerSearch}>
                <input
                  autoFocus
                  placeholder="Search variables…"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
              <div className={style.pickerList}>
                {items.length === 0 ? (
                  <p className={style.pickerEmpty}>No variables found</p>
                ) : (
                  items.map((v) => (
                    <div key={v.id} className={style.pickerItem} onClick={() => onSelect(v.name)}>
                      <span className={style.pickerVarName}>{v.name}</span>
                      <TypeBadge type={v.type} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
