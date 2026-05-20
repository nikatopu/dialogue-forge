"use client";

import { useState } from "react";
import {
  User,
  Zap,
  Sliders,
  FileText,
  Trash2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AttributeEditor } from "./AttributeEditor";
import { useGraphStore } from "@/store/useGraphStore";
import { useEditorStore } from "@/store/useEditorStore";
import { cn } from "@/lib/utils";
import type { ForgeNode, CharacterNodeData, ActionNodeData, ActionType } from "@/types";

const TABS = [
  { id: "properties", label: "Properties", icon: FileText },
  { id: "attributes", label: "Attributes", icon: Sliders },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface NodeInspectorProps {
  node: ForgeNode;
}

export function NodeInspector({ node }: NodeInspectorProps) {
  const [activeTab, setActiveTab] = useState<TabId>("properties");
  const { updateNodeData, removeNode, duplicateNode } = useGraphStore();
  const { setSelectedNodeId } = useEditorStore();

  const isCharacter = node.type === "character";
  const data = node.data as CharacterNodeData | ActionNodeData;
  const schema = data.attributeSchema ?? [];
  const values = data.attributes ?? {};
  const attrCount = schema.length;

  function handleDelete() {
    removeNode(node.id);
    setSelectedNodeId(null);
  }

  function handleDuplicate() {
    duplicateNode(node.id);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Node identity strip */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-3 border-b border-border/50",
          "bg-linear-to-r",
          isCharacter
            ? "from-indigo-500/5 to-transparent"
            : "from-emerald-500/5 to-transparent"
        )}
      >
        <div
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
            isCharacter
              ? "bg-indigo-500/15 border border-indigo-500/25"
              : "bg-emerald-500/15 border border-emerald-500/25"
          )}
        >
          {isCharacter ? (
            <User className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            {isCharacter
              ? (data as CharacterNodeData).name || "Unnamed"
              : (data as ActionNodeData).label || "Action"}
          </p>
          <p className="text-[10px] text-muted-foreground capitalize">
            {node.type} node
          </p>
        </div>
        {/* Quick actions */}
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            className="w-6 h-6 text-muted-foreground/50 hover:text-foreground"
            onClick={handleDuplicate}
            title="Duplicate"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="w-6 h-6 text-muted-foreground/50 hover:text-destructive"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50 shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium",
                "border-b-2 transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
              {tab.id === "attributes" && attrCount > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[9px] h-3.5 px-1 min-w-4 justify-center"
                >
                  {attrCount}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab body */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "properties" && (
          <div className="p-4 space-y-4">
            {isCharacter ? (
              <CharacterProperties
                nodeId={node.id}
                data={data as CharacterNodeData}
                onUpdate={(patch) => updateNodeData(node.id, patch)}
              />
            ) : (
              <ActionProperties
                nodeId={node.id}
                data={data as ActionNodeData}
                onUpdate={(patch) => updateNodeData(node.id, patch)}
              />
            )}

            <Separator className="opacity-40" />

            {/* Node metadata */}
            <div className="space-y-1.5">
              <SectionLabel>Node ID</SectionLabel>
              <p className="text-[10px] font-mono text-muted-foreground bg-muted/30 rounded px-2 py-1 break-all">
                {node.id}
              </p>
            </div>

            <div className="space-y-1">
              <SectionLabel>Position</SectionLabel>
              <div className="flex gap-2">
                <Chip label="X" value={Math.round(node.position.x)} />
                <Chip label="Y" value={Math.round(node.position.y)} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "attributes" && (
          <div className="p-4">
            <AttributeEditor
              nodeId={node.id}
              schema={schema}
              values={values}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Property forms ──────────────────────────────────── */

interface CharacterPropertiesProps {
  nodeId: string;
  data: CharacterNodeData;
  onUpdate: (patch: Partial<CharacterNodeData>) => void;
}

function CharacterProperties({ data, onUpdate }: CharacterPropertiesProps) {
  return (
    <div className="space-y-3.5">
      <InspectorField label="Name">
        <InlineInput
          value={data.name}
          placeholder="Character name"
          onCommit={(v) => onUpdate({ name: v })}
        />
      </InspectorField>

      <InspectorField label="Dialogue">
        <InlineTextarea
          value={data.dialogue}
          placeholder="What does this character say?"
          onCommit={(v) => onUpdate({ dialogue: v })}
          rows={4}
        />
      </InspectorField>

      <InspectorField label="Emotion">
        <InlineInput
          value={data.emotion ?? ""}
          placeholder="e.g. Happy, Sad, Angry"
          onCommit={(v) => onUpdate({ emotion: v })}
        />
      </InspectorField>

      <InspectorField label="Portrait URL">
        <InlineInput
          value={data.portrait ?? ""}
          placeholder="https://…"
          onCommit={(v) => onUpdate({ portrait: v })}
        />
      </InspectorField>
    </div>
  );
}

const ACTION_TYPES: ActionType[] = [
  "trigger",
  "branch",
  "jump",
  "end",
  "custom",
];

interface ActionPropertiesProps {
  nodeId: string;
  data: ActionNodeData;
  onUpdate: (patch: Partial<ActionNodeData>) => void;
}

function ActionProperties({ data, onUpdate }: ActionPropertiesProps) {
  return (
    <div className="space-y-3.5">
      <InspectorField label="Label">
        <InlineInput
          value={data.label}
          placeholder="Action label"
          onCommit={(v) => onUpdate({ label: v })}
        />
      </InspectorField>

      <InspectorField label="Action Type">
        <select
          value={data.actionType}
          onChange={(e) => onUpdate({ actionType: e.target.value as ActionType })}
          aria-label="Action type"
          className={cn(
            "h-7 w-full rounded-md border border-border/60 bg-background/40 px-2",
            "text-xs text-foreground appearance-none cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-ring/50"
          )}
        >
          {ACTION_TYPES.map((t) => (
            <option key={t} value={t} className="capitalize">
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </InspectorField>
    </div>
  );
}

/* ─── Reusable primitives ─────────────────────────────── */

function InspectorField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
      {children}
    </p>
  );
}

function InlineInput({
  value,
  placeholder,
  onCommit,
}: {
  value: string;
  placeholder?: string;
  onCommit: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);

  return (
    <Input
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onCommit(local)}
      onKeyDown={(e) => e.key === "Enter" && onCommit(local)}
      placeholder={placeholder}
      className="h-7 text-xs bg-background/40 border-border/60"
    />
  );
}

function InlineTextarea({
  value,
  placeholder,
  onCommit,
  rows = 3,
}: {
  value: string;
  placeholder?: string;
  onCommit: (v: string) => void;
  rows?: number;
}) {
  const [local, setLocal] = useState(value);

  return (
    <textarea
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onCommit(local)}
      rows={rows}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-md border border-border/60 bg-background/40 px-2.5 py-1.5",
        "text-xs text-foreground resize-none leading-relaxed",
        "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
      )}
    />
  );
}

function Chip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 bg-muted/30 rounded px-2 py-1">
      <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
      <span className="text-[11px] font-mono text-foreground/70 tabular-nums">
        {value}
      </span>
    </div>
  );
}
