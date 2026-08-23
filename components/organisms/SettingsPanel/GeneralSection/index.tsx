"use client";

import { useState, useSyncExternalStore } from "react";
import cn from "classnames";
import { Button } from "@/components/atoms/Button";
import { ConfirmModal } from "@/components/organisms/ConfirmModal";
import { useGraphStore } from "@/store/useGraphStore";
import { getLaunchMode, setLaunchMode, subscribeToLaunchMode } from "@/lib/launchPreference";
import sections from "../sections.module.scss";
import style from "./GeneralSection.module.scss";

export function GeneralSection({ onClose }: { onClose: () => void }) {
  const { nodes, clearGraph } = useGraphStore();
  const [confirmClear, setConfirmClear] = useState(false);

  /*
   * The server snapshot is false so SSR and the first client render agree; the
   * real value arrives on hydration. Subscribing keeps the switch in sync when
   * the preference is changed from anywhere else.
   */
  const skipLanding = useSyncExternalStore(
    subscribeToLaunchMode,
    () => getLaunchMode() === "editor",
    () => false,
  );

  function toggleSkipLanding() {
    setLaunchMode(skipLanding ? "landing" : "editor");
  }

  return (
    <div>
      <div className={sections.sectionHeader}><h2 className={sections.sectionTitle}>General</h2></div>

      <h3 className={sections.subsectionTitle}>Startup</h3>
      <div className={style.settingCard}>
        <div className={style.settingRow}>
          <div>
            <p className={style.settingTitle}>Skip the landing page</p>
            <p className={style.settingDesc}>
              Open the editor straight away when you visit dialogueforge.org. The landing
              page stays reachable at <code className={style.code}>/?stay=1</code>.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={skipLanding}
            aria-label="Skip the landing page"
            onClick={toggleSkipLanding}
            className={cn(style.toggle, skipLanding && style.toggleOn)}
          >
            <span className={style.toggleKnob} />
          </button>
        </div>
      </div>

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
