"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  User,
  Zap,
  ChevronRight,
  GripVertical,
  FileText,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { PROJECT_TEMPLATES } from "@/lib/templates";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
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
    description: "Trigger event",
    icon: Zap,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/12",
    dotColor: "bg-emerald-400",
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
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-2 py-1.5 rounded-md",
          "hover:bg-muted/50 transition-colors group"
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
            className="text-[10px] h-4 px-1.5 min-w-[18px] justify-center"
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
            <div className="pt-1 pb-1 space-y-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen } = useEditorStore();
  const { addNode, nodes, loadGraph } = useGraphStore();
  const { setProjectName } = useEditorStore();
  const [search, setSearch] = useState("");
  const [openSections, setOpenSections] = useState({
    nodes: true,
    templates: false,
  });
  const [pendingTemplate, setPendingTemplate] = useState<ProjectTemplate | null>(null);

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

  function confirmLoadTemplate() {
    if (!pendingTemplate) return;
    loadGraph(pendingTemplate.nodes, pendingTemplate.edges);
    setProjectName(pendingTemplate.name);
    setPendingTemplate(null);
  }

  const filteredTemplates = NODE_TEMPLATES.filter(
    (n) =>
      !search ||
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
    <motion.aside
      animate={{
        width: sidebarOpen ? 240 : 0,
        opacity: sidebarOpen ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="shrink-0 overflow-hidden border-r border-border bg-card flex flex-col"
    >
      {/* Fixed-width inner prevents layout thrash during animation */}
      <div className="w-[240px] flex flex-col h-full">
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
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left",
                    "hover:bg-muted/50 transition-colors group"
                  )}
                >
                  <div className="w-7 h-7 rounded-md bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-muted transition-colors">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {t.description}
                    </p>
                  </div>
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

    <ConfirmModal
      open={pendingTemplate !== null}
      title="Replace current project?"
      message="Loading this template will replace your existing nodes and edges. Make sure you've exported anything you want to keep."
      confirmLabel="Load template"
      onConfirm={confirmLoadTemplate}
      onCancel={() => setPendingTemplate(null)}
    />
    </>
  );
}

function NodeTypeCard({
  node,
}: {
  node: (typeof NODE_TEMPLATES)[number];
}) {
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
        "active:scale-[0.97] transition-all duration-150 group"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
          node.iconBg
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
