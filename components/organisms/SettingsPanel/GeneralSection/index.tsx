"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { ConfirmModal } from "@/components/organisms/ConfirmModal";
import { useGraphStore } from "@/store/useGraphStore";
import sections from "../sections.module.scss";
import style from "./GeneralSection.module.scss";

export function GeneralSection({ onClose }: { onClose: () => void }) {
  const { nodes, clearGraph } = useGraphStore();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div>
      <div className={sections.sectionHeader}><h2 className={sections.sectionTitle}>General</h2></div>
      <h3 className={sections.subsectionTitle}>Workspace</h3>
      <div className={style.dangerCard}>
        <div className={style.dangerRow}>
          <div>
            <p className={style.dangerTitle}>Clear workspace</p>
            <p className={style.dangerDesc}>Delete all nodes, edges, and undo history. This cannot be undone.</p>
          </div>
          <Button size="sm" variant="destructive" className={style.clearBtn} disabled={nodes.length === 0} onClick={() => setConfirmClear(true)}>Clear all</Button>
        </div>
      </div>
      <ConfirmModal
        open={confirmClear}
        title="Clear workspace?"
        message="This will permanently delete all nodes, edges, and undo history. This action cannot be undone."
        confirmLabel="Delete everything"
        onConfirm={() => { clearGraph(); setConfirmClear(false); onClose(); }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
