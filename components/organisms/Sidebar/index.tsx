"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, User, Zap, Flag, ChevronRight,
  GripVertical, FileText, X, Download, Upload,
} from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { Separator } from "@/components/atoms/Separator";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { PROJECT_TEMPLATES } from "@/lib/templates";
import cn from "classnames";
import type { ProjectTemplate } from "@/lib/templates";
import style from "./Sidebar.module.scss";

const TAG_COLORS: Record<string, string> = {
  start:        "bg-teal-500/15 text-teal-400 border-teal-500/25",
  trigger:      "bg-amber-500/15 text-amber-400 border-amber-500/25",
  triggers:     "bg-amber-500/15 text-amber-400 border-amber-500/25",
  branch:       "bg-violet-500/15 text-violet-400 border-violet-500/25",
  choice:       "bg-violet-500/15 text-violet-400 border-violet-500/25",
  combat:       "bg-rose-500/15 text-rose-400 border-rose-500/25",
  audio:        "bg-sky-500/15 text-sky-400 border-sky-500/25",
  game:         "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  ui:           "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  jump:         "bg-orange-500/15 text-orange-400 border-orange-500/25",
  "multi-entry":"bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  basic:        "",
  linear:       "",
};

const NODE_TEMPLATES = [
  {
    type: "character" as const,
    label: "Character",
    description: "Dialogue node",
    icon: User,
    iconColor: { color: "oklch(0.65 0.19 260)" },
    iconBg: { backgroundColor: "oklch(0.52 0.255 262 / 12%)" },
  },
  {
    type: "action" as const,
    label: "Action",
    description: "Trigger / branch / jump",
    icon: Zap,
    iconColor: { color: "oklch(0.72 0.18 155)" },
    iconBg: { backgroundColor: "oklch(0.52 0.18 155 / 12%)" },
  },
  {
    type: "start" as const,
    label: "Start",
    description: "Entry point",
    icon: Flag,
    iconColor: { color: "oklch(0.68 0.15 180)" },
    iconBg: { backgroundColor: "oklch(0.5 0.15 180 / 12%)" },
  },
];

interface SectionProps {
  label: string;
  open: boolean;
  onToggle: () => void;
  badge?: number;
  children: React.ReactNode;
}

function Section({ label, open, onToggle, badge, children }: SectionProps) {
  return (
    <div className={style.section}>
      <button type="button" onClick={onToggle} className={style.sectionToggle}>
        <div className={style.sectionLabel}>
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
          </motion.div>
          <span className={style.sectionLabelText}>{label}</span>
        </div>
        {badge !== undefined && badge > 0 && (
          <Badge variant="secondary" className={style.badge}>
            {badge}
          </Badge>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className={style.sectionBody}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useEditorStore();
  const { addNode, nodes, loadGraph, insertGraph } = useGraphStore();
  const { setProjectName } = useEditorStore();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [openSections, setOpenSections] = useState({ nodes: true, templates: false });
  const [pendingTemplate, setPendingTemplate] = useState<ProjectTemplate | null>(null);

  const toggle = (key: keyof typeof openSections) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  function handleTemplateClick(t: ProjectTemplate) {
    if (nodes.length > 0) setPendingTemplate(t);
    else { loadGraph(t.nodes, t.edges); setProjectName(t.name); }
  }

  function handleInsert() {
    if (!pendingTemplate) return;
    insertGraph(pendingTemplate.nodes, pendingTemplate.edges);
    setPendingTemplate(null);
  }

  function handleReplace() {
    if (!pendingTemplate) return;
    loadGraph(pendingTemplate.nodes, pendingTemplate.edges);
    setProjectName(pendingTemplate.name);
    setPendingTemplate(null);
  }

  const filteredTemplates = NODE_TEMPLATES.filter(
    (n) => !search || n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className={style.backdrop}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={
          isMobile
            ? { x: sidebarOpen ? 0 : -288 }
            : { width: sidebarOpen ? 240 : 0, opacity: sidebarOpen ? 1 : 0 }
        }
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className={cn(style.aside, isMobile && style.asideMobile)}
      >
        <div className={cn(style.inner, isMobile && style.mobile)}>
          <div className={style.searchArea}>
            <div className={style.searchWrapper}>
              <Search className={style.searchIcon} />
              <input
                placeholder="Search nodes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={style.searchInput}
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearch("")}
                    className={style.clearButton}
                  >
                    <X size={12} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          <ScrollArea className={style.scrollContent}>
            <div className={style.contentPad}>
              <Section label="Node Types" open={openSections.nodes} onToggle={() => toggle("nodes")}>
                {filteredTemplates.length > 0
                  ? filteredTemplates.map((node) => <NodeTypeCard key={node.type} node={node} />)
                  : <p className={style.emptySearch}>No nodes match &ldquo;{search}&rdquo;</p>
                }
              </Section>

              <Separator style={{ opacity: 0.5, margin: "0.5rem 0" }} />

              <Section label="Templates" open={openSections.templates} onToggle={() => toggle("templates")} badge={PROJECT_TEMPLATES.length}>
                {PROJECT_TEMPLATES.map((t) => (
                  <button key={t.id} type="button" onClick={() => handleTemplateClick(t)} className={style.templateButton}>
                    <div className={style.templateRow}>
                      <div className={style.templateIconWrap}>
                        <FileText size={14} style={{ color: "var(--muted-foreground)" }} />
                      </div>
                      <div className={style.templateMeta}>
                        <p className={style.templateName}>{t.name}</p>
                        <p className={style.templateDesc}>{t.description}</p>
                      </div>
                    </div>
                    {t.tags.length > 0 && (
                      <div className={style.templateTags}>
                        {t.tags.map((tag) => (
                          <span
                            key={tag}
                            className={cn(style.tag, TAG_COLORS[tag] ?? "")}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </Section>
            </div>
          </ScrollArea>
        </div>
      </motion.aside>

      {typeof document !== "undefined" && pendingTemplate &&
        createPortal(
          <TemplateActionModal
            template={pendingTemplate}
            onInsert={handleInsert}
            onReplace={handleReplace}
            onCancel={() => setPendingTemplate(null)}
          />,
          document.body,
        )}
    </>
  );
}

function NodeTypeCard({ node }: { node: (typeof NODE_TEMPLATES)[number] }) {
  const Icon = node.icon;

  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("application/forge-node-type", node.type);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      data-node-type={node.type}
      className={style.nodeCard}
    >
      <div className={style.nodeIconWrap} style={node.iconBg}>
        <Icon size={16} style={node.iconColor} />
      </div>
      <div className={style.nodeInfo}>
        <p className={style.nodeName}>{node.label}</p>
        <p className={style.nodeDesc}>{node.description}</p>
      </div>
      <GripVertical className={style.gripIcon} />
    </div>
  );
}

function TemplateActionModal({
  template,
  onInsert,
  onReplace,
  onCancel,
}: {
  template: ProjectTemplate;
  onInsert: () => void;
  onReplace: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={style.modalOverlay}
      onClick={onCancel}
    >
      <div className={style.modalBackdrop} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className={style.modalPanel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={style.modalHeader}>
          <div className={style.modalTitle}>
            <FileText size={14} style={{ color: "var(--muted-foreground)" }} />
            {template.name}
          </div>
          <button type="button" aria-label="Cancel" onClick={onCancel} className={style.modalCloseBtn}>
            <X size={16} />
          </button>
        </div>

        <div className={style.modalBody}>
          <p className={style.modalDescription}>{template.description}</p>
          <div className={style.modalActions}>
            <button type="button" onClick={onInsert} className={style.actionBtn}>
              <div className={style.actionIconWrap}>
                <Download size={16} style={{ color: "var(--primary)" }} />
              </div>
              <div className={style.actionText}>
                <p className={style.actionTitle}>Insert into current project</p>
                <p className={style.actionSubtitle}>Append template nodes below the existing graph</p>
              </div>
            </button>
            <button type="button" onClick={onReplace} className={cn(style.actionBtn, style.actionBtnDestructive)}>
              <div className={cn(style.actionIconWrap, style.actionIconWrapDestructive)}>
                <Upload size={16} style={{ color: "color-mix(in oklch, var(--destructive) 70%, transparent)" }} />
              </div>
              <div className={style.actionText}>
                <p className={style.actionTitle}>Replace current project</p>
                <p className={style.actionSubtitle}>Clear all existing nodes and load this template</p>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
