"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { buildInitialState } from "@/lib/simulateVariables";
import { usePreviewSession } from "./usePreviewSession";
import { PreviewHeader } from "./PreviewHeader";
import { EntrySelection } from "./EntrySelection";
import { SetupPhase } from "./SetupPhase";
import { StatePanel } from "./StatePanel";
import { DialogueView } from "./DialogueView";
import style from "./PreviewModal.module.scss";

interface PreviewModalProps { open: boolean; onClose: () => void; }

function EmptyGraph() {
  return (
    <div className={style.noNodes}>
      <AlertTriangle size={32} className={style.noNodesIcon} />
      <span>Add some nodes to the canvas to preview.</span>
    </div>
  );
}

export function PreviewModal({ open, onClose }: PreviewModalProps) {
  const s = usePreviewSession(open, onClose);
  const { nodes, variables, startNodes, phase } = s;

  if (!open) return null;

  const playing = phase === "playing";
  const stepNumber = playing && s.history.length > 0 ? s.history.length + 1 : null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={style.overlay}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={style.backdrop} onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={style.panel}
          >
            <PreviewHeader
              phase={phase}
              stepNumber={stepNumber}
              showBack={playing && (startNodes.length > 1 || variables.length > 0)}
              showRestart={playing}
              showStateToggle={playing && variables.length > 0}
              statePanelOpen={s.statePanelOpen}
              onBack={s.handleBack}
              onRestart={s.handleRestart}
              onToggleState={() => s.setStatePanelOpen((v) => !v)}
              onClose={onClose}
            />

            <AnimatePresence>
              {playing && s.statePanelOpen && variables.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className={style.statePanelWrap}
                >
                  <StatePanel variables={variables} varState={s.varState} changes={s.stateChanges} />
                </motion.div>
              )}
            </AnimatePresence>

            <ScrollArea className={style.body}>
              <div className={style.bodyPad}>
                {nodes.length === 0 ? <EmptyGraph />
                  : phase === "entry" ? <EntrySelection startNodes={startNodes} onSelect={s.handleSelectEntry} />
                  : phase === "setup" ? (
                    <SetupPhase
                      variables={variables}
                      onStart={s.handleStartPreview}
                      onSkip={() => s.handleStartPreview(buildInitialState(variables))}
                    />
                  ) : (
                    <DialogueView
                      currentNode={s.currentNode}
                      ended={s.ended}
                      varState={s.varState}
                      variables={variables}
                      onRestart={s.handleRestart}
                      onClose={onClose}
                      choices={s.allOutgoing}
                      lockedEdgeIds={s.lockedEdgeIds}
                      lockedEdgeReasons={s.lockedEdgeReasons}
                      onChoice={s.handleChoice}
                    />
                  )
                }
              </div>
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
