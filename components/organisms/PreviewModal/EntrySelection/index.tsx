"use client";

import { motion } from "framer-motion";
import { Flag, ChevronRight } from "lucide-react";
import type { ForgeNode, StartNodeData } from "@/types";
import style from "./EntrySelection.module.scss";

type EntrySelectionProps = {
  startNodes: ForgeNode[];
  onSelect: (id: string) => void;
};

export function EntrySelection({ startNodes, onSelect }: EntrySelectionProps) {
  return (
    <div className={style.container}>
      <p className={style.hint}>Choose a starting branch to preview:</p>
      {startNodes.map((n, i) => (
        <motion.button
          key={n.id}
          type="button"
          onClick={() => onSelect(n.id)}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={style.entryBtn}
        >
          <div className={style.entryBtnIcon}><Flag size={16} className={style.flagIcon} /></div>
          <div className={style.entryBtnMeta}>
            <p className={style.entryBtnName}>{(n.data as StartNodeData).name || "Unnamed"}</p>
            <p className={style.entryBtnSub}>Start node</p>
          </div>
          <ChevronRight size={16} className={style.chevron} />
        </motion.button>
      ))}
    </div>
  );
}
