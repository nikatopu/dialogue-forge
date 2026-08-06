"use client";

import { User, Zap, Flag, ChevronRight, RotateCcw, AlertTriangle, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { interpolateText } from "@/lib/interpolation";
import type { VarState } from "@/lib/simulateVariables";
import type {
  ForgeNode, CharacterNodeData, ActionNodeData, StartNodeData,
  ProjectVariable, RuntimeState,
} from "@/types";
import { CATEGORY_CONFIG, EXECUTION_LABELS, formatOpSymbol } from "../previewHelpers";
import { ChoiceList, type ChoiceListProps } from "./ChoiceList";
import style from "./DialogueView.module.scss";

type DialogueViewProps = {
  currentNode: ForgeNode | null;
  ended: boolean;
  varState: VarState;
  variables: ProjectVariable[];
  onRestart: () => void;
  onClose: () => void;
} & ChoiceListProps;

export function DialogueView({
  currentNode, ended, varState, variables, onRestart, onClose,
  choices, lockedEdgeIds, lockedEdgeReasons, onChoice,
}: DialogueViewProps) {
  const choiceProps: ChoiceListProps = { choices, lockedEdgeIds, lockedEdgeReasons, onChoice };

  if (!currentNode) return <NoStartNode />;
  if (ended) return <EndedState onRestart={onRestart} onClose={onClose} />;

  if (currentNode.type === "start") {
    return <StartStep data={currentNode.data as StartNodeData} choiceProps={choiceProps} />;
  }
  if (currentNode.type === "character") {
    return <CharacterStep data={currentNode.data as CharacterNodeData} varState={varState} variables={variables} choiceProps={choiceProps} />;
  }
  return <ActionStep data={currentNode.data as ActionNodeData} varState={varState} variables={variables} choiceProps={choiceProps} />;
}

function StartStep({ data, choiceProps }: { data: StartNodeData; choiceProps: ChoiceListProps }) {
  return (
    <div className={style.stack}>
      <div className={style.startStep}>
        <Flag size={16} className={style.startFlag} />
        <div><p className={style.startStepLabel}>Entry Point</p><p className={style.startStepName}>{data.name || "Unnamed"}</p></div>
      </div>
      <ChoiceList {...choiceProps} />
    </div>
  );
}

function CharacterStep({ data, varState, variables, choiceProps }: {
  data: CharacterNodeData; varState: VarState; variables: ProjectVariable[]; choiceProps: ChoiceListProps;
}) {
  const runtimeState: RuntimeState = Object.fromEntries(variables.map((v) => [v.name, varState[v.id] ?? v.defaultValue]));
  const displayDialogue = data.dialogue ? interpolateText(data.dialogue, runtimeState) : "";
  return (
    <div className={style.stack}>
      <div className={style.characterHeader}>
        <div className={style.characterAvatar}>
          {data.portrait
            ? <img src={data.portrait} alt={data.name} className={style.characterAvatarImg} />
            : <User size={18} className={style.charUserIcon} />}
        </div>
        <div>
          <p className={style.characterName}>{data.name || <span className={style.charUnnamed}>Unnamed</span>}</p>
          {data.emotion && <span className={style.characterEmotion}>{data.emotion}</span>}
        </div>
      </div>
      <div className={style.dialogueBubble}>
        {displayDialogue ? <p className={style.dialogueText}>{displayDialogue}</p> : <p className={style.dialogueEmpty}>No dialogue set.</p>}
      </div>
      <ChoiceList {...choiceProps} />
    </div>
  );
}

function ActionStep({ data, varState, variables, choiceProps }: {
  data: ActionNodeData; varState: VarState; variables: ProjectVariable[]; choiceProps: ChoiceListProps;
}) {
  if (data.actionType === "trigger") return <TriggerStep data={data} choiceProps={choiceProps} />;
  if (data.actionType === "setVariable") return <SetVariableStep data={data} varState={varState} variables={variables} choiceProps={choiceProps} />;
  return (
    <div className={style.stack}>
      <div className={style.actionStep}>
        <Zap size={16} className={style.actionZap} />
        <div><p className={style.actionLabel}>{data.actionType}</p><p className={style.actionName}>{data.label || "Action"}</p></div>
      </div>
      <ChoiceList {...choiceProps} />
    </div>
  );
}

function SetVariableStep({ data, varState, variables, choiceProps }: {
  data: ActionNodeData; varState: VarState; variables: ProjectVariable[]; choiceProps: ChoiceListProps;
}) {
  const va = data.variableAction;
  const varDef = va ? variables.find((v) => v.id === va.variableId) : null;
  const currentVal = va && varDef ? varState[va.variableId] : null;
  return (
    <div className={style.stack}>
      <div className={style.setVarCard}>
        <SlidersHorizontal size={15} className={style.setVarIcon} />
        <div>
          <p className={style.setVarLabel}>Set Variable</p>
          <p className={style.setVarName}>{data.label || "Set Variable"}</p>
          {varDef && va && (
            <p className={style.setVarExpr}>
              <code>{varDef.name} {formatOpSymbol(va.operation)} {va.operation === "toggle" ? "!current" : String(va.value ?? "")}</code>
              {currentVal !== null && <span className={style.setVarCurrent}> (currently: {String(currentVal)})</span>}
            </p>
          )}
        </div>
      </div>
      <ChoiceList {...choiceProps} />
    </div>
  );
}

function TriggerStep({ data, choiceProps }: { data: ActionNodeData; choiceProps: ChoiceListProps }) {
  const category = data.category ?? "custom";
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.custom;
  const Icon = cfg.icon;
  const params = data.params ?? {};
  const hasParams = Object.keys(params).length > 0;
  return (
    <div className={style.stack}>
      <div className={style.triggerCard} style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
        <div className={style.triggerHeader}>
          <Icon size={16} style={{ color: cfg.color, flexShrink: 0 }} />
          <div className={style.triggerMeta}>
            <div className={style.triggerLabels}>
              <p className={style.triggerTypeLabel}>TRIGGER</p>
              <Badge variant="outline" className={style.triggerBadge} style={{ color: cfg.color, borderColor: cfg.border }}>{category}</Badge>
            </div>
            <p className={style.triggerName}>{data.event || data.label || "Trigger"}</p>
          </div>
          <span className={style.execLabel} style={{ color: cfg.color }}>{EXECUTION_LABELS[data.executionMode ?? "immediate"]}</span>
        </div>
        {hasParams && (
          <div className={style.triggerParams}>
            {Object.entries(params).map(([k, v]) => (
              <span key={k} className={style.paramChip}>{k}=<span className={style.paramValue}>{v}</span></span>
            ))}
          </div>
        )}
      </div>
      <ChoiceList {...choiceProps} />
    </div>
  );
}

function EndedState({ onRestart, onClose }: { onRestart: () => void; onClose: () => void }) {
  return (
    <div className={style.endState}>
      <div className={style.endIcon}><ChevronRight size={24} className={style.endGlyph} /></div>
      <div><p className={style.endTitle}>Dialogue ended</p><p className={style.endSub}>The conversation reached an end node.</p></div>
      <div className={style.endActions}>
        <Button variant="outline" size="sm" onClick={onRestart} className={style.restartBtn}><RotateCcw size={12} />Restart</Button>
        <Button size="sm" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

function NoStartNode() {
  return (
    <div className={style.noStart}>
      <AlertTriangle size={32} className={style.noStartIcon} />
      <span className={style.noStartText}>Could not find a starting node.</span>
    </div>
  );
}
