"use client";

import cn from "classnames";
import { Badge } from "@/components/atoms/Badge";
import { TABS, type TabId } from "../nodeInspectorConfig";
import style from "./NodeTabs.module.scss";

type NodeTabsProps = {
  activeTab: TabId;
  onSelect: (id: TabId) => void;
  attrCount: number;
};

export function NodeTabs({ activeTab, onSelect, attrCount }: NodeTabsProps) {
  return (
    <div className={style.tabs}>
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={cn(style.tab, isActive && style.tabActive)}
          >
            <Icon size={12} />
            {tab.label}
            {tab.id === "attributes" && attrCount > 0 && (
              <Badge variant="secondary" className={style.tabBadge}>{attrCount}</Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
