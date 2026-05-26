"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, FolderOpen, Settings, LogOut, Cloud, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useProjectStore } from "@/store/useProjectStore";
import { FREE_PLAN_CLOUD_LIMIT } from "@/lib/services/projectService";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  onSettings: () => void;
}

export function UserMenu({ onSettings }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, signOut, cloudProjectCount } = useProjectStore();

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const initials = (user.fullName ?? user.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-colors",
          "hover:bg-muted/50",
          open && "bg-muted/50",
        )}
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.fullName ?? ""}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[9px] font-bold text-primary">
            {initials}
          </div>
        )}
        <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-border bg-card shadow-xl z-[200] overflow-hidden"
          >
            {/* Profile header */}
            <div className="px-3.5 py-3 border-b border-border/50">
              <p className="text-xs font-semibold truncate">{user.fullName ?? "User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              {/* Plan usage */}
              <div className="mt-2 flex items-center gap-1.5">
                <Cloud className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                <div className="flex-1 h-1 rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/60 transition-all"
                    style={{ width: `${Math.min(100, (cloudProjectCount / FREE_PLAN_CLOUD_LIMIT) * 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground/60 tabular-nums whitespace-nowrap">
                  {cloudProjectCount} / {FREE_PLAN_CLOUD_LIMIT}
                </span>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <MenuItem icon={FolderOpen} label="My Projects" href="/projects" onClick={() => setOpen(false)} />
              <MenuItem icon={Settings} label="Settings" onClick={() => { setOpen(false); onSettings(); }} />
            </div>

            <div className="border-t border-border/50 py-1">
              <MenuItem
                icon={LogOut}
                label="Sign Out"
                onClick={() => { setOpen(false); signOut(); }}
                danger
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  href,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const cls = cn(
    "w-full flex items-center gap-2.5 px-3.5 py-2 text-xs transition-colors",
    danger
      ? "text-destructive hover:bg-destructive/10"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
  );

  if (href) {
    return (
      <Link href={href} className={cls} onClick={onClick}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} onClick={onClick}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {label}
    </button>
  );
}

/* ─── Guest sign-in button ───────────────────────────────── */

export function SignInButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium transition-colors",
        "border border-border/60 bg-card/60 hover:bg-muted/50 text-muted-foreground hover:text-foreground",
      )}
    >
      <User className="w-3 h-3" />
      Sign in
    </button>
  );
}
