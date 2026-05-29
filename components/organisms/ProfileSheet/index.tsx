"use client";
import { Cloud, FolderOpen, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { BottomSheet } from "@/components/atoms/BottomSheet";
import { Button } from "@/components/atoms/Button";
import { useProjectStore } from "@/store/useProjectStore";
import { FREE_PLAN_CLOUD_LIMIT } from "@/lib/services/projectService";
import cn from "classnames";
import style from "./ProfileSheet.module.scss";

interface ProfileSheetProps { open: boolean; onClose: () => void; onSettings: () => void; onSignIn: () => void; }

export function ProfileSheet({ open, onClose, onSettings, onSignIn }: ProfileSheetProps) {
  const { user, signOut, cloudProjectCount } = useProjectStore();
  if (!user) {
    return (
      <BottomSheet open={open} onClose={onClose} title="Account">
        <div className={style.guestBody}>
          <div className={style.guestIcon}><User size={28} style={{ color: "color-mix(in oklch, var(--muted-foreground) 40%, transparent)" }} /></div>
          <div className={style.guestText}>
            <p className={style.guestTitle}>Not signed in</p>
            <p className={style.guestDesc}>Sign in to save projects to the cloud and access them from anywhere.</p>
          </div>
          <Button className={style.signInBtn} onClick={() => { onClose(); onSignIn(); }}>Sign in</Button>
          <p className={style.guestNote}>Your local project is always available without signing in.</p>
        </div>
      </BottomSheet>
    );
  }
  const initials = (user.fullName ?? user.email ?? "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <BottomSheet open={open} onClose={onClose} title="Account">
      <div className={style.content}>
        <div className={style.profileRow}>
          {user.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName ?? ""} className={style.profileAvatar} /> : <div className={style.profileInitials}>{initials}</div>}
          <div className={style.profileMeta}>
            <p className={style.profileName}>{user.fullName ?? "User"}</p>
            <p className={style.profileEmail}>{user.email}</p>
            {user.provider && <p className={style.profileProvider}>via {user.provider}</p>}
          </div>
        </div>
        <div className={style.usageSection}>
          <div className={style.usageHeader}>
            <div className={style.usageLeft}><Cloud size={14} style={{ color: "color-mix(in oklch, var(--muted-foreground) 70%, transparent)" }} /><span className={style.usageLabel}>Cloud projects</span></div>
            <span className={style.usageCount}>{cloudProjectCount} / {FREE_PLAN_CLOUD_LIMIT}</span>
          </div>
          <div className={style.usageBar}><div className={cn(style.usageFill, cloudProjectCount >= FREE_PLAN_CLOUD_LIMIT && style.usageFillLimit)} style={{ width: `${Math.min(100, (cloudProjectCount / FREE_PLAN_CLOUD_LIMIT) * 100)}%` }} /></div>
          {cloudProjectCount >= FREE_PLAN_CLOUD_LIMIT && <p className={style.limitMsg}>Cloud project limit reached — delete one to create more.</p>}
        </div>
        <div className={style.actions}>
          <SheetAction icon={FolderOpen} label="My Projects" href="/projects" onClick={onClose} />
          <SheetAction icon={Settings} label="Settings" onClick={() => { onClose(); onSettings(); }} />
          <SheetAction icon={LogOut} label="Sign Out" danger onClick={() => { onClose(); signOut(); }} />
        </div>
      </div>
    </BottomSheet>
  );
}

function SheetAction({ icon: Icon, label, href, onClick, danger }: { icon: React.ElementType; label: string; href?: string; onClick?: () => void; danger?: boolean; }) {
  const cls = cn(style.action, danger && style.actionDanger);
  if (href) return <Link href={href} className={cls} onClick={onClick}><Icon size={16} style={{ flexShrink: 0 }} />{label}</Link>;
  return <button type="button" className={cls} onClick={onClick}><Icon size={16} style={{ flexShrink: 0 }} />{label}</button>;
}
