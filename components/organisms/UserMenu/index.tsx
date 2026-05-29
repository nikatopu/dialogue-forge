"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, FolderOpen, Settings, LogOut, Cloud, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useProjectStore } from "@/store/useProjectStore";
import { FREE_PLAN_CLOUD_LIMIT } from "@/lib/services/projectService";
import cn from "classnames";
import style from "./UserMenu.module.scss";

interface UserMenuProps { onSettings: () => void; }

export function UserMenu({ onSettings }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, signOut, cloudProjectCount } = useProjectStore();
  useEffect(() => {
    function handler(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  if (!user) return null;
  const initials = (user.fullName ?? user.email ?? "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div ref={ref} className={style.container}>
      <button type="button" onClick={() => setOpen((o) => !o)} className={cn(style.trigger, open && style.triggerOpen)}>
        {user.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName ?? ""} className={style.avatar} /> : <div className={style.initials}>{initials}</div>}
        <ChevronDown size={12} className={cn(style.chevron, open && style.chevronOpen)} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.12 }} className={style.dropdown}>
            <div className={style.profile}>
              <p className={style.profileName}>{user.fullName ?? "User"}</p>
              <p className={style.profileEmail}>{user.email}</p>
              <div className={style.usageRow}>
                <Cloud size={12} style={{ color: "color-mix(in oklch, var(--muted-foreground) 60%, transparent)", flexShrink: 0 }} />
                <div className={style.usageBar}><div className={style.usageFill} style={{ width: `${Math.min(100, (cloudProjectCount / FREE_PLAN_CLOUD_LIMIT) * 100)}%` }} /></div>
                <span className={style.usageCount}>{cloudProjectCount} / {FREE_PLAN_CLOUD_LIMIT}</span>
              </div>
            </div>
            <div className={style.menuItems}>
              <MenuItem icon={FolderOpen} label="My Projects" href="/projects" onClick={() => setOpen(false)} />
              <MenuItem icon={Settings} label="Settings" onClick={() => { setOpen(false); onSettings(); }} />
            </div>
            <div className={style.menuDanger}>
              <MenuItem icon={LogOut} label="Sign Out" onClick={() => { setOpen(false); signOut(); }} danger />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon: Icon, label, href, onClick, danger }: { icon: React.ElementType; label: string; href?: string; onClick?: () => void; danger?: boolean; }) {
  const cls = cn(style.menuItem, danger && style.menuItemDanger);
  if (href) return <Link href={href} className={cls} onClick={onClick}><Icon size={14} style={{ flexShrink: 0 }} />{label}</Link>;
  return <button type="button" className={cls} onClick={onClick}><Icon size={14} style={{ flexShrink: 0 }} />{label}</button>;
}

export function SignInButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={style.signInBtn}>
      <User size={12} />Sign in
    </button>
  );
}
