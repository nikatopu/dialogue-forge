"use client";

import { useState, useEffect } from "react";
import { Cloud, Download, LogOut, GitBranch, Globe, Loader2, Upload, User } from "lucide-react";
import cn from "classnames";
import { Button } from "@/components/atoms/Button";
import { Separator } from "@/components/atoms/Separator";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useProjectStore } from "@/store/useProjectStore";
import { projectService, FREE_PLAN_CLOUD_LIMIT } from "@/lib/services/projectService";
import { serializeGraph, downloadJson } from "@/lib/exportGraph";
import { SignInModal } from "@/components/organisms/SignInModal";
import type { Json } from "@/lib/supabase/types";
import sections from "../sections.module.scss";
import style from "./AccountSection.module.scss";

export function AccountSection() {
  const { settingsOpen } = useEditorStore();
  const { user, signOut, cloudProjectCount, canCreateCloudProject, loadProjects } = useProjectStore();
  const { nodes } = useGraphStore();
  const { currentProjectId, setCurrentProjectId } = useEditorStore();
  const [signInOpen, setSignInOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const isLocalDraft = !currentProjectId && nodes.length > 0;

  function handleExportLocal() {
    const { nodes: n, edges: e } = useGraphStore.getState();
    const { projectName } = useEditorStore.getState();
    downloadJson(serializeGraph(n, e, projectName));
  }

  async function handleSaveDraftToCloud() {
    if (!user || !canCreateCloudProject()) return;
    setSavingDraft(true);
    try {
      const { nodes: n, edges: e } = useGraphStore.getState();
      const { projectName } = useEditorStore.getState();
      const serialized = serializeGraph(n, e, projectName);
      const project = await projectService.create({ name: projectName, graph: { nodes: serialized.nodes, edges: serialized.edges } as unknown as Json, mode: "cloud" });
      setCurrentProjectId(project.id);
      await loadProjects();
    } finally { setSavingDraft(false); }
  }

  useEffect(() => { if (!settingsOpen) setSavingDraft(false); }, [settingsOpen]);

  return (
    <div>
      <div className={sections.sectionHeader}><h2 className={sections.sectionTitle}>Account</h2></div>
      {user ? (
        <div className={style.stack}>
          <div className={style.profileCard}>
            <div className={style.profileRow}>
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt="" className={style.profileAvatar} />
                : <div className={style.profileInitials}>{(user.fullName || user.email || "?")[0].toUpperCase()}</div>
              }
              <div className={style.profileMeta}>
                {user.fullName && <p className={style.profileName}>{user.fullName}</p>}
                {user.email && <p className={style.profileEmail}>{user.email}</p>}
                {user.provider && (
                  <p className={style.profileProvider}>
                    {user.provider === "github" ? <GitBranch size={10} /> : <Globe size={10} />}
                    {user.provider}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className={style.usageCard}>
            <div className={style.usageHeader}>
              <div className={style.usageLeft}><Cloud size={12} /><span>Cloud projects</span></div>
              <span className={style.usageCount}>{cloudProjectCount} / {FREE_PLAN_CLOUD_LIMIT}</span>
            </div>
            <div className={style.usageBar}>
              <div className={cn(style.usageFill, cloudProjectCount >= FREE_PLAN_CLOUD_LIMIT && style.usageFillLimit)} style={{ width: `${Math.min(100, (cloudProjectCount / FREE_PLAN_CLOUD_LIMIT) * 100)}%` }} />
            </div>
          </div>
          <div className={style.actionList}>
            {isLocalDraft && canCreateCloudProject() && (
              <button type="button" onClick={handleSaveDraftToCloud} disabled={savingDraft} className={style.actionBtn}>
                {savingDraft ? <Loader2 size={14} className={style.spin} /> : <Upload size={14} />}
                {savingDraft ? "Saving to cloud…" : "Save local draft to cloud"}
              </button>
            )}
            {nodes.length > 0 && (
              <button type="button" onClick={handleExportLocal} className={style.actionBtn}><Download size={14} />Export local data</button>
            )}
            <Separator className={style.actionSeparator} />
            <button type="button" onClick={signOut} className={cn(style.actionBtn, style.actionBtnDanger)}><LogOut size={14} />Sign out</button>
          </div>
        </div>
      ) : (
        <div className={style.guestCard}>
          <div className={style.guestIconBox}><User size={18} className={style.guestIcon} /></div>
          <div>
            <p className={style.guestTitle}>No account</p>
            <p className={style.guestDesc}>Sign in to save projects to the cloud and access them from any device.</p>
          </div>
          <Button size="sm" className={style.signInBtn} onClick={() => setSignInOpen(true)}>Sign in</Button>
        </div>
      )}
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
}
