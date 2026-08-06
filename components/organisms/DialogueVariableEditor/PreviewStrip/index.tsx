"use client";

import type { ReactNode } from "react";
import style from "./PreviewStrip.module.scss";

function renderPreview(text: string): ReactNode {
  const parts = text.split(/(\{[^}]+\})/);
  return parts.map((p, i) =>
    p.startsWith("{") && p.endsWith("}")
      ? <span key={i} className={style.previewUnresolved}>{p}</span>
      : p,
  );
}

export function PreviewStrip({ text }: { text: string }) {
  return (
    <div className={style.previewStrip}>
      <p className={style.previewLabel}>Preview</p>
      {renderPreview(text)}
    </div>
  );
}
