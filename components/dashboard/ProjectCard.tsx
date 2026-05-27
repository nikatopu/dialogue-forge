"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  HardDrive,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Trash2,
  Pencil,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { cn } from "@/lib/utils";
import type { CloudProject } from "@/types";

interface ProjectCardProps {
  project: CloudProject;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  index?: number;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function ProjectCard({ project, onDelete, onDuplicate, onRename, index = 0 }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameValue, setNameValue] = useState(project.name);

  const isCloud = project.mode === "cloud";
  const nodeCount = project.graph.nodes.length;
  const isRecent = Date.now() - new Date(project.updatedAt).getTime() < 86400000; // 24h

  function commitRename() {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== project.name) {
      onRename(project.id, trimmed);
    }
    setRenaming(false);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.2 }}
        className={cn(
          "group relative rounded-xl border border-border/60 bg-card/70",
          "hover:border-border hover:bg-card hover:shadow-lg",
          "transition-all duration-200",
        )}
      >
        {/* Preview area */}
        <Link href={`/projects/${project.id}`} className="block">
          <div className="h-28 bg-gradient-to-br from-muted/30 to-muted/10 border-b border-border/40 relative overflow-hidden">
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(oklch(1 0 0 / 15%) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-2 opacity-30">
                {Array.from({ length: Math.min(nodeCount, 5) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-5 rounded-md bg-primary/60 border border-primary/30"
                    style={{ transform: `translateY(${(i % 2) * 6}px)` }}
                  />
                ))}
                {nodeCount === 0 && (
                  <div className="text-[10px] text-muted-foreground/50">Empty</div>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              {isRecent && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/20 border border-primary/30 text-primary">
                  Recent
                </span>
              )}
            </div>

            <div className="absolute top-2 right-2">
              <span className={cn(
                "flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-md border",
                isCloud
                  ? "bg-sky-500/15 border-sky-500/25 text-sky-400"
                  : "bg-muted/40 border-border/50 text-muted-foreground",
              )}>
                {isCloud ? <Cloud className="w-2.5 h-2.5" /> : <HardDrive className="w-2.5 h-2.5" />}
                {isCloud ? "Cloud" : "Local"}
              </span>
            </div>
          </div>
        </Link>

        {/* Card body */}
        <div className="px-3.5 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {renaming ? (
                <input
                  autoFocus
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") { setNameValue(project.name); setRenaming(false); }
                  }}
                  className="w-full text-sm font-medium bg-muted/40 border border-primary/40 rounded-md px-2 py-0.5 outline-none focus:ring-1 focus:ring-primary/50"
                />
              ) : (
                <p className="text-sm font-medium truncate">{project.name}</p>
              )}
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-2.5 h-2.5 text-muted-foreground/50" />
                <span className="text-[10px] text-muted-foreground/70">{timeAgo(project.updatedAt)}</span>
                <span className="text-muted-foreground/30">·</span>
                <span className="text-[10px] text-muted-foreground/70">{nodeCount} nodes</span>
              </div>
            </div>

            {/* Action menu */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setMenuOpen((o) => !o); }}
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-md transition-colors",
                  "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50",
                  "opacity-0 group-hover:opacity-100",
                  menuOpen && "opacity-100 bg-muted/50 text-muted-foreground",
                )}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-border bg-card shadow-xl z-20 py-1 overflow-hidden">
                    <CardMenuItem icon={ExternalLink} label="Open" href={`/projects/${project.id}`} />
                    <CardMenuItem icon={Pencil} label="Rename" onClick={() => { setMenuOpen(false); setRenaming(true); }} />
                    <CardMenuItem icon={Copy} label="Duplicate" onClick={() => { setMenuOpen(false); onDuplicate(project.id); }} />
                    <div className="border-t border-border/50 mt-1 pt-1">
                      <CardMenuItem icon={Trash2} label="Delete" danger onClick={() => { setMenuOpen(false); setConfirmDelete(true); }} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <ConfirmModal
        open={confirmDelete}
        title={`Delete "${project.name}"?`}
        message="This will permanently delete the project and all its nodes. This cannot be undone."
        confirmLabel="Delete project"
        onConfirm={() => { setConfirmDelete(false); onDelete(project.id); }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

function CardMenuItem({
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
    "w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors",
    danger
      ? "text-destructive hover:bg-destructive/10"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
  );
  if (href) return <Link href={href} className={cls}><Icon className="w-3.5 h-3.5" />{label}</Link>;
  return <button type="button" className={cls} onClick={onClick}><Icon className="w-3.5 h-3.5" />{label}</button>;
}
