"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { Separator } from "@/components/atoms/Separator";
import { useEditorStore } from "@/store/useEditorStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useVariableStore } from "@/store/useVariableStore";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { PROJECT_TEMPLATES } from "@/lib/templates";
import cn from "classnames";
import type { ProjectTemplate } from "@/lib/templates";
import { NODE_TEMPLATES } from "./sidebarConfig";
import { Section } from "./Section";
import { NodeTypeCard } from "./NodeTypeCard";
import { TemplateCard } from "./TemplateCard";
import { TemplateActionModal } from "./TemplateActionModal";
import style from "./Sidebar.module.scss";

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, setProjectName } = useEditorStore();
  const { nodes, loadGraph, insertGraph } = useGraphStore();
  const { setVariables } = useVariableStore();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [openSections, setOpenSections] = useState({ nodes: true, templates: false });
  const [pendingTemplate, setPendingTemplate] = useState<ProjectTemplate | null>(null);

  const toggle = (key: keyof typeof openSections) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  function handleTemplateClick(t: ProjectTemplate) {
    if (nodes.length > 0) setPendingTemplate(t);
    else {
      loadGraph(t.nodes, t.edges);
      if (t.variables) setVariables(t.variables);
      setProjectName(t.name);
    }
  }

  function handleInsert() {
    if (!pendingTemplate) return;
    insertGraph(pendingTemplate.nodes, pendingTemplate.edges);
    // Variables are merged (not replaced) on insert so they don't clobber existing ones
    setPendingTemplate(null);
  }

  function handleReplace() {
    if (!pendingTemplate) return;
    loadGraph(pendingTemplate.nodes, pendingTemplate.edges);
    if (pendingTemplate.variables) setVariables(pendingTemplate.variables);
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
        <div className={style.inner}>
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

              <Separator className={style.sectionSeparator} />

              <Section label="Templates" open={openSections.templates} onToggle={() => toggle("templates")} badge={PROJECT_TEMPLATES.length}>
                {PROJECT_TEMPLATES.map((t) => (
                  <TemplateCard key={t.id} template={t} onClick={() => handleTemplateClick(t)} />
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
