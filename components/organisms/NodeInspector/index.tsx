"use client";

import { useState } from "react";
import { Separator } from "@/components/atoms/Separator";
import { AttributeEditor } from "@/components/organisms/AttributeEditor";
import { useGraphStore } from "@/store/useGraphStore";
import { useEditorStore } from "@/store/useEditorStore";
import type { ForgeNode, CharacterNodeData, ActionNodeData, StartNodeData } from "@/types";
import { type TabId } from "./nodeInspectorConfig";
import { NodeStrip } from "./NodeStrip";
import { NodeTabs } from "./NodeTabs";
import { StartNodeProperties } from "./StartNodeProperties";
import { CharacterProperties } from "./CharacterProperties";
import { ActionProperties } from "./ActionProperties";
import fields from "./fields.module.scss";
import style from "./NodeInspector.module.scss";

export function NodeInspector({ node }: { node: ForgeNode }) {
  const [activeTab, setActiveTab] = useState<TabId>("properties");
  const { updateNodeData, removeNode, duplicateNode } = useGraphStore();
  const { setSelectedNodeId, setMobileInspectorOpen } = useEditorStore();

  const isStart = node.type === "start";
  const isCharacter = node.type === "character";
  const data = node.data as CharacterNodeData | ActionNodeData | StartNodeData;
  const schema = (data as CharacterNodeData).attributeSchema ?? [];
  const values = (data as CharacterNodeData).attributes ?? {};

  function handleDelete() { removeNode(node.id); setSelectedNodeId(null); setMobileInspectorOpen(false); }
  function handleDuplicate() { duplicateNode(node.id); }

  return (
    <div className={style.container}>
      <NodeStrip node={node} onDuplicate={handleDuplicate} onDelete={handleDelete} />
      <NodeTabs activeTab={activeTab} onSelect={setActiveTab} attrCount={schema.length} />

      <div className={style.body}>
        {activeTab === "properties" && (
          <div className={style.bodyPad}>
            {isStart
              ? <StartNodeProperties data={data as StartNodeData} onUpdate={(p) => updateNodeData(node.id, p)} />
              : isCharacter
              ? <CharacterProperties nodeId={node.id} data={data as CharacterNodeData} onUpdate={(p) => updateNodeData(node.id, p)} />
              : <ActionProperties nodeId={node.id} data={data as ActionNodeData} onUpdate={(p) => updateNodeData(node.id, p)} />
            }
            <Separator className={style.metaSeparator} />
            <div className={fields.field}>
              <p className={fields.fieldLabel}>Node ID</p>
              <p className={style.metaBox}>{node.id}</p>
            </div>
            <div className={fields.field}>
              <p className={fields.fieldLabel}>Position</p>
              <div className={style.positionRow}>
                <div className={style.chip}>
                  <span className={style.chipLabel}>X</span>
                  <span className={style.chipValue}>{Math.round(node.position.x)}</span>
                </div>
                <div className={style.chip}>
                  <span className={style.chipLabel}>Y</span>
                  <span className={style.chipValue}>{Math.round(node.position.y)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "attributes" && (
          <div className={style.bodyPad}>
            {isStart
              ? <p className={fields.emptyNote}>Start nodes do not have attributes.</p>
              : <AttributeEditor nodeId={node.id} schema={schema} values={values} />
            }
          </div>
        )}
      </div>
    </div>
  );
}
