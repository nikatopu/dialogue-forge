"use client";

import { FileText } from "lucide-react";
import cn from "classnames";
import type { ProjectTemplate } from "@/lib/templates";
import { TAG_COLORS } from "../sidebarConfig";
import style from "./TemplateCard.module.scss";

type TemplateCardProps = {
  template: ProjectTemplate;
  onClick: () => void;
};

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  return (
    <button type="button" onClick={onClick} className={style.templateButton}>
      <div className={style.templateRow}>
        <div className={style.templateIconWrap}>
          <FileText size={14} className={style.templateIcon} />
        </div>
        <div className={style.templateMeta}>
          <p className={style.templateName}>{template.name}</p>
          <p className={style.templateDesc}>{template.description}</p>
        </div>
      </div>
      {template.tags.length > 0 && (
        <div className={style.templateTags}>
          {template.tags.map((tag) => (
            <span key={tag} className={cn(style.tag, TAG_COLORS[tag] ?? "")}>{tag}</span>
          ))}
        </div>
      )}
    </button>
  );
}
