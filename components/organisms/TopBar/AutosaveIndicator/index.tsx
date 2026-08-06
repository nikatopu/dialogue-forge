"use client";

import { Cloud, CloudOff, Loader2, AlertCircle } from "lucide-react";
import cn from "classnames";
import type { AutosaveStatus } from "@/types";
import style from "./AutosaveIndicator.module.scss";

export function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  if (status === "idle") return null;

  const cls = cn(
    style.autosaveIndicator,
    status === "saving" && style.autosaveSaving,
    status === "saved" && style.autosaveSaved,
    status === "error" && style.autosaveError,
    status === "offline" && style.autosaveOffline,
  );

  return (
    <div className={cls}>
      {status === "saving" && <Loader2 size={12} className={style.spin} />}
      {status === "saved" && <Cloud size={12} />}
      {status === "error" && <AlertCircle size={12} />}
      {status === "offline" && <CloudOff size={12} />}
      <span>
        {status === "saving" && "Saving…"}
        {status === "saved" && "Saved"}
        {status === "error" && "Save failed"}
        {status === "offline" && "Offline"}
      </span>
    </div>
  );
}
