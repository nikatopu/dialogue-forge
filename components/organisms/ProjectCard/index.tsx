"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Cloud, HardDrive, MoreHorizontal, ExternalLink, Copy, Trash2, Pencil, Clock } from "lucide-react";
import Link from "next/link";
import { ConfirmModal } from "@/components/organisms/ConfirmModal";
import cn from "classnames";
import type { CloudProject } from "@/types";
import style from "./ProjectCard.module.scss";

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

interface ProjectCardProps {
  project: CloudProject;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  index?: number;
}

export function ProjectCard({ project, onDelete, onDuplicate, onRename, index = 0 }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameValue, setNameValue] = useState(project.name);

  const isCloud = project.mode === "cloud";
  const nodeCount = project.graph.nodes.length;
  const isRecent = Date.now() - new Date(project.updatedAt).getTime() < 86400000;

  function commitRename() {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== project.name) onRename(project.id, trimmed);
    setRenaming(false);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.2 }}
        className={style.card}
      >
        <Link href={`/projects/${project.id}`} className={style.previewLink}>
          <div className={style.preview}>
            <div className={style.gridPattern} style={{ backgroundImage: "radial-gradient(oklch(1 0 0 / 15%) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className={style.previewNodes}>
              <div className={style.previewNodesInner}>
                {Array.from({ length: Math.min(nodeCount, 5) }).map((_, i) => (
                  <div key={i} className={style.previewNodeDot} style={{ transform: `translateY(${(i % 2) * 6}px)` }} />
                ))}
                {nodeCount === 0 && <div className={style.previewEmpty}>Empty</div>}
              </div>
            </div>
            <div className={style.badgesTop}>
              {isRecent && <span className={cn(style.badgeTop, style.badgeRecent)}>Recent</span>}
            </div>
            <div className={cn(style.badgeCloud, isCloud ? style.badgeCloudCloud : style.badgeCloudLocal)}>
              {isCloud ? <Cloud size={10} /> : <HardDrive size={10} />}
              {isCloud ? "Cloud" : "Local"}
            </div>
          </div>
        </Link>

        <div className={style.body}>
          <div className={style.bodyRow}>
            <div className={style.nameMeta}>
              {renaming ? (
                <input autoFocus value={nameValue} onChange={(e) => setNameValue(e.target.value)} onBlur={commitRename} onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setNameValue(project.name); setRenaming(false); } }} className={style.nameInput} />
              ) : (
                <p className={style.name}>{project.name}</p>
              )}
              <div className={style.sub}>
                <Clock size={10} style={{ opacity: 0.5 }} />
                <span>{timeAgo(project.updatedAt)}</span>
                <span className={style.dot}>·</span>
                <span>{nodeCount} nodes</span>
              </div>
            </div>

            <div style={{ position: "relative", flexShrink: 0 }}>
              <button type="button" onClick={(e) => { e.preventDefault(); setMenuOpen((o) => !o); }} className={cn(style.menuTrigger, menuOpen && style.menuTriggerOpen)}>
                <MoreHorizontal size={14} />
              </button>
              {menuOpen && (
                <>
                  <div className={style.menuBackdrop} onClick={() => setMenuOpen(false)} />
                  <div className={style.menu}>
                    <CardMenuItem icon={ExternalLink} label="Open" href={`/projects/${project.id}`} />
                    <CardMenuItem icon={Pencil} label="Rename" onClick={() => { setMenuOpen(false); setRenaming(true); }} />
                    <CardMenuItem icon={Copy} label="Duplicate" onClick={() => { setMenuOpen(false); onDuplicate(project.id); }} />
                    <div className={style.menuDivider} />
                    <CardMenuItem icon={Trash2} label="Delete" danger onClick={() => { setMenuOpen(false); setConfirmDelete(true); }} />
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

function CardMenuItem({ icon: Icon, label, href, onClick, danger }: {
  icon: React.ElementType; label: string; href?: string; onClick?: () => void; danger?: boolean;
}) {
  const cls = cn(style.menuItem, danger && style.menuItemDanger);
  if (href) return <Link href={href} className={cls}><Icon size={14} />{label}</Link>;
  return <button type="button" className={cls} onClick={onClick}><Icon size={14} />{label}</button>;
}
