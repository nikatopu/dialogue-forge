"use client";

import { motion } from "framer-motion";
import { FileText, X, Download, Upload } from "lucide-react";
import cn from "classnames";
import type { ProjectTemplate } from "@/lib/templates";
import style from "./TemplateActionModal.module.scss";

type TemplateActionModalProps = {
  template: ProjectTemplate;
  onInsert: () => void;
  onReplace: () => void;
  onCancel: () => void;
};

export function TemplateActionModal({ template, onInsert, onReplace, onCancel }: TemplateActionModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={style.modalOverlay}
      onClick={onCancel}
    >
      <div className={style.modalBackdrop} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className={style.modalPanel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={style.modalHeader}>
          <div className={style.modalTitle}>
            <FileText size={14} className={style.titleIcon} />
            {template.name}
          </div>
          <button type="button" aria-label="Cancel" onClick={onCancel} className={style.modalCloseBtn}>
            <X size={16} />
          </button>
        </div>

        <div className={style.modalBody}>
          <p className={style.modalDescription}>{template.description}</p>
          <div className={style.modalActions}>
            <button type="button" onClick={onInsert} className={style.actionBtn}>
              <div className={style.actionIconWrap}>
                <Download size={16} className={style.insertIcon} />
              </div>
              <div className={style.actionText}>
                <p className={style.actionTitle}>Insert into current project</p>
                <p className={style.actionSubtitle}>Append template nodes below the existing graph</p>
              </div>
            </button>
            <button type="button" onClick={onReplace} className={cn(style.actionBtn, style.actionBtnDestructive)}>
              <div className={cn(style.actionIconWrap, style.actionIconWrapDestructive)}>
                <Upload size={16} className={style.replaceIcon} />
              </div>
              <div className={style.actionText}>
                <p className={style.actionTitle}>Replace current project</p>
                <p className={style.actionSubtitle}>Clear all existing nodes and load this template</p>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
