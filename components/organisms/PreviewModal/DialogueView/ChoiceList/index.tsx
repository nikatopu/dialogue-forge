"use client";

import { motion } from "framer-motion";
import { ChevronRight, Lock } from "lucide-react";
import cn from "classnames";
import type { DialogueEdge } from "@/types";
import style from "./ChoiceList.module.scss";

export type ChoiceListProps = {
  choices: DialogueEdge[];
  lockedEdgeIds: Set<string>;
  lockedEdgeReasons: Map<string, string>;
  onChoice: (e: DialogueEdge) => void;
};

export function ChoiceList({ choices, lockedEdgeIds, lockedEdgeReasons, onChoice }: ChoiceListProps) {
  if (choices.length === 0) return <p className={style.branchEnd}>— End of branch —</p>;
  return (
    <div className={style.choiceList}>
      {choices.map((edge, i) => {
        const locked = lockedEdgeIds.has(edge.id);
        const reason = locked ? lockedEdgeReasons.get(edge.id) : undefined;
        return (
          <motion.button
            key={edge.id}
            type="button"
            onClick={locked ? undefined : () => onChoice(edge)}
            disabled={locked}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(style.choiceBtn, locked && style.choiceBtnLocked)}
          >
            <span className={style.choiceNum}>{i + 1}</span>
            <span className={style.choiceText}>
              {edge.data?.optionText || <span className={style.choiceEmpty}>Continue</span>}
              {reason && <span className={style.choiceLockReason}>Requires: {reason}</span>}
            </span>
            {locked
              ? <Lock size={12} className={style.choiceLockIcon} />
              : <ChevronRight size={14} className={style.choiceChevron} />
            }
          </motion.button>
        );
      })}
    </div>
  );
}
