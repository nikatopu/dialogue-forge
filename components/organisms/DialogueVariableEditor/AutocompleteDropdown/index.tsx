"use client";

import cn from "classnames";
import { TypeBadge } from "@/components/atoms/TypeBadge";
import type { ProjectVariable } from "@/types";
import style from "./AutocompleteDropdown.module.scss";

type AutocompleteDropdownProps = {
  items: ProjectVariable[];
  activeIndex: number;
  onSelect: (name: string) => void;
};

export function AutocompleteDropdown({ items, activeIndex, onSelect }: AutocompleteDropdownProps) {
  if (items.length === 0) return null;
  return (
    <div className={style.autocomplete}>
      {items.map((v, i) => (
        <div
          key={v.id}
          className={cn(style.autocompleteItem, i === activeIndex && style.active)}
          onMouseDown={(e) => { e.preventDefault(); onSelect(v.name); }}
        >
          <span className={style.autocompleteVarName}>{v.name}</span>
          <TypeBadge type={v.type} />
        </div>
      ))}
    </div>
  );
}
