"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  User,
  Zap,
  Flag,
  ChevronRight,
  GripVertical,
  FileText,
  X,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { PROJECT_TEMPLATES } from "@/lib/templates";
import { cn } from "@/lib/utils";
import type { ProjectTemplate } from "@/lib/templates";

const NODE_TEMPLATES = [
  {
    type: "character" as const,
    label: "Character",
    description: "Dialogue node",
    icon: User,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/12",
    dotColor: "bg-indigo-400",
  },
  {
    type: "action" as const,
    label: "Action",
    description: "Trigger / branch / jump",
    icon: Zap,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/12",
    dotColor: "bg-emerald-400",
  },
  {
    type: "start" as const,
    label: "Start",
    description: "Entry point",
    icon: Flag,
    iconColor: "text-teal-400",
    iconBg: "bg-teal-500/12",
    dotColor: "bg-teal-400",
  },
];

const TAG_COLORS: Record<string, string> = {
  start: "bg-teal-500/15 text-teal-400 border-teal-500/25",
  trigger: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  triggers: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  branch: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  choice: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  combat: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  audio: "bg-sky-500/15 text-sky-400 border-sky-500/25",
  game: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  ui: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  jump: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  "multi-entry": "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  basic: "bg-muted text-muted-foreground border-border",
  linear: "bg-muted text-muted-foreground border-border",
};

interface SectionProps {
  label: string;
  open: boolean;
  onToggle: () => void;
  badge?: number;
  children: React.ReactNode;
}

function Section({ label, open, onToggle, badge, children }: SectionProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-57 flex items-center justify-between px-2 py-1.5 rounded-md",
          "hover:bg-muted/50 transition-colors group",
        )}
      >
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </motion.div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        {badge !== undefined && badge > 0 && (
          <Badge
            variant="secondary"
            className="text-[10px] h-4 px-1.5 min-w-4.5 justify-center"
          >
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
            className="overflow-hidden"
          >
            <div className="pt-1 pb-1 space-y-1 overflow-y-scroll max-h-100 w-55">
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
  const [openSections, setOpenSections] = useState({
    nodes: true,
    templates: false,
  });
  const [pendingTemplate, setPendingTemplate] =
    useState<ProjectTemplate | null>(null);

  const toggle = (key: keyof typeof openSections) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  function handleTemplateClick(t: ProjectTemplate) {
    if (nodes.length > 0) {
      setPendingTemplate(t);
    } else {
      loadGraph(t.nodes, t.edges);
      setProjectName(t.name);
    }
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
    (n) =>
      !search ||
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
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
        className={cn(
          "bg-card flex flex-col border-r border-border",
          isMobile
            ? "fixed left-0 top-12 bottom-0 z-50 w-72 shadow-2xl"
            : "shrink-0 overflow-hidden",
        )}
      >
        {/* Fixed-width inner prevents layout thrash during desktop animation */}
        <div className={cn("flex flex-col h-full", isMobile ? "w-72" : "w-60")}>
          {/* Search */}
          <div className="px-2 py-2 border-b border-border shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search nodes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 pr-7 text-xs bg-background/40 border-border/60 focus:bg-background/70"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Scrollable content */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              {/* Node Types */}
              <Section
                label="Node Types"
                open={openSections.nodes}
                onToggle={() => toggle("nodes")}
              >
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((node) => (
                    <NodeTypeCard key={node.type} node={node} />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground px-2 py-2">
                    No nodes match &ldquo;{search}&rdquo;
                  </p>
                )}
              </Section>

              <Separator className="my-2 opacity-50" />

              {/* Templates */}
              <Section
                label="Templates"
                open={openSections.templates}
                onToggle={() => toggle("templates")}
                badge={PROJECT_TEMPLATES.length}
              >
                {PROJECT_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTemplateClick(t)}
                    className={cn(
                      "w-full flex flex-col gap-1 px-2.5 py-2 rounded-lg text-left",
                      "hover:bg-muted/50 transition-colors group",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-muted transition-colors">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{t.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {t.description}
                        </p>
                      </div>
                    </div>
                    {t.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pl-9">
                        {t.tags.map((tag) => (
                          <span
                            key={tag}
                            className={cn(
                              "text-[9px] font-medium px-1.5 py-0.5 rounded border",
                              TAG_COLORS[tag] ??
                                "bg-muted text-muted-foreground border-border",
                            )}
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

          {/* Add Node button */}
          <div className="p-2 border-t border-border shrink-0">
            <Button
              type="button"
              className="w-full h-8 gap-1.5 text-xs font-medium"
              onClick={() => {
                const offset = nodes.length * 24;
                addNode("character", { x: 100 + offset, y: 100 + offset });
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Node
            </Button>
          </div>
        </div>
      </motion.aside>

      {typeof document !== "undefined" &&
        pendingTemplate &&
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
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg border border-border/60",
        "cursor-grab active:cursor-grabbing select-none",
        "hover:border-border hover:bg-muted/40 hover:shadow-sm",
        "active:scale-[0.97] transition-all duration-150 group",
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
          node.iconBg,
        )}
      >
        <Icon className={cn("w-4 h-4", node.iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium leading-tight">{node.label}</p>
        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
          {node.description}
        </p>
      </div>

      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors shrink-0" />
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
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="relative w-full max-w-sm mx-4 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            <h2 className="text-sm font-semibold">{template.name}</h2>
          </div>
          <button
            type="button"
            aria-label="Cancel"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-md p-1 hover:bg-muted/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {template.description}
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={onInsert}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border/60 bg-card hover:bg-muted/40 hover:border-border transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <Download className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium">Insert into current project</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Append template nodes below the existing graph
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={onReplace}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/30 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 group-hover:bg-destructive/15 transition-colors">
                <Upload className="w-4 h-4 text-destructive/70" />
              </div>
              <div>
                <p className="text-xs font-medium">Replace current project</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Clear all existing nodes and load this template
                </p>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
