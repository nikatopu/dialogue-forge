"use client";

import { Cloud, FolderOpen, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/useProjectStore";
import { FREE_PLAN_CLOUD_LIMIT } from "@/lib/services/projectService";
import { cn } from "@/lib/utils";

interface ProfileSheetProps {
  open: boolean;
  onClose: () => void;
  onSettings: () => void;
  onSignIn: () => void;
}

export function ProfileSheet({ open, onClose, onSettings, onSignIn }: ProfileSheetProps) {
  const { user, signOut, cloudProjectCount } = useProjectStore();

  if (!user) {
    return (
      <BottomSheet open={open} onClose={onClose} title="Account">
        <div className="p-5 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center">
            <User className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">Not signed in</p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Sign in to save projects to the cloud and access them from anywhere.
            </p>
          </div>
          <Button
            className="w-full"
            onClick={() => { onClose(); onSignIn(); }}
          >
            Sign in
          </Button>
          <p className="text-[10px] text-muted-foreground/50">
            Your local project is always available without signing in.
          </p>
        </div>
      </BottomSheet>
    );
  }

  const initials = (user.fullName ?? user.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <BottomSheet open={open} onClose={onClose} title="Account">
      <div className="pb-6">
        {/* Profile header */}
        <div className="flex items-center gap-3.5 px-5 py-4 border-b border-border/50">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.fullName ?? ""}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user.fullName ?? "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            {user.provider && (
              <p className="text-[10px] text-muted-foreground/60 capitalize mt-0.5">
                via {user.provider}
              </p>
            )}
          </div>
        </div>

        {/* Cloud usage */}
        <div className="px-5 py-3.5 border-b border-border/50">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-muted-foreground/70" />
              <span className="text-xs text-muted-foreground">Cloud projects</span>
            </div>
            <span className="text-xs font-medium tabular-nums">
              {cloudProjectCount} / {FREE_PLAN_CLOUD_LIMIT}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                cloudProjectCount >= FREE_PLAN_CLOUD_LIMIT
                  ? "bg-destructive/70"
                  : "bg-primary/60",
              )}
              style={{ width: `${Math.min(100, (cloudProjectCount / FREE_PLAN_CLOUD_LIMIT) * 100)}%` }}
            />
          </div>
          {cloudProjectCount >= FREE_PLAN_CLOUD_LIMIT && (
            <p className="text-[10px] text-destructive/80 mt-1">
              Cloud project limit reached — delete one to create more.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-3 pt-2 space-y-0.5">
          <SheetAction
            icon={FolderOpen}
            label="My Projects"
            href="/projects"
            onClick={onClose}
          />
          <SheetAction
            icon={Settings}
            label="Settings"
            onClick={() => { onClose(); onSettings(); }}
          />
          <SheetAction
            icon={LogOut}
            label="Sign Out"
            danger
            onClick={() => { onClose(); signOut(); }}
          />
        </div>
      </div>
    </BottomSheet>
  );
}

function SheetAction({
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
    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors",
    danger
      ? "text-destructive hover:bg-destructive/10 active:bg-destructive/15"
      : "text-foreground/80 hover:bg-muted/40 active:bg-muted/60",
  );

  if (href) {
    return (
      <Link href={href} className={cls} onClick={onClick}>
        <Icon className="w-4 h-4 shrink-0" />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} onClick={onClick}>
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </button>
  );
}
