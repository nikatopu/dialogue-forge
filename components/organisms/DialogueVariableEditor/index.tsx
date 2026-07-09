"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import cn from "classnames";
import style from "./DialogueVariableEditor.module.scss";
import { useVariableStore } from "@/store/useVariableStore";
import { interpolateText } from "@/lib/interpolation";
import { TypeBadge } from "@/components/atoms/TypeBadge";
import type { ProjectVariable, RuntimeState } from "@/types";

interface DialogueVariableEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

// Detect if there's an unclosed `{` before the cursor that's starting a variable reference
function getAutocompletePrefix(text: string, cursorPos: number): string | null {
  const before = text.slice(0, cursorPos);
  const match = before.match(/\{([a-zA-Z_][a-zA-Z0-9_.]*)$/);
  if (match) return match[1]; // partial name typed so far
  if (before.endsWith("{")) return ""; // just opened brace
  return null;
}

// Render preview text, highlighting any unresolved {tokens}
function renderPreview(text: string): React.ReactNode {
  const parts = text.split(/(\{[^}]+\})/);
  return parts.map((p, i) =>
    p.startsWith("{") && p.endsWith("}")
      ? <span key={i} className={style.previewUnresolved}>{p}</span>
      : p
  );
}

export function DialogueVariableEditor({
  value,
  onChange,
  placeholder,
  rows = 3,
}: DialogueVariableEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const variables = useVariableStore((s) => s.variables);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  const [autocompleteVisible, setAutocompleteVisible] = useState(false);
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);

  // Build runtime state from variable default values for the live preview
  const runtimeState: RuntimeState = Object.fromEntries(
    variables.map((v) => [v.name, v.defaultValue])
  );

  const previewText = value ? interpolateText(value, runtimeState) : "";

  // Filtered variable list for picker
  const filteredForPicker = variables.filter((v) =>
    !pickerSearch || v.name.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  // Autocomplete: get current prefix at cursor
  function getCurrentPrefix(): string | null {
    const el = textareaRef.current;
    if (!el) return null;
    return getAutocompletePrefix(el.value, el.selectionStart ?? 0);
  }

  // Filtered variable list for autocomplete
  const autocompletePrefix = autocompleteVisible ? getCurrentPrefix() : null;
  const filteredForAutocomplete = variables.filter((v) =>
    autocompletePrefix === null
      ? false
      : v.name.toLowerCase().startsWith(autocompletePrefix.toLowerCase())
  );

  // Insert {varName} at the current cursor position
  const insertAtCursor = useCallback(
    (varName: string) => {
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const inserted = `{${varName}}`;
      const next = el.value.slice(0, start) + inserted + el.value.slice(end);
      onChange(next);
      // restore cursor after inserted token
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + inserted.length, start + inserted.length);
      });
      setPickerOpen(false);
    },
    [onChange]
  );

  // Complete a partial autocomplete token: replace from the opening `{` to cursor
  const completeAutocomplete = useCallback(
    (varName: string) => {
      const el = textareaRef.current;
      if (!el) return;
      const cursorPos = el.selectionStart ?? el.value.length;
      const before = el.value.slice(0, cursorPos);
      // Find the position of the opening `{`
      const bracePos = before.lastIndexOf("{");
      if (bracePos === -1) return;
      const inserted = `{${varName}}`;
      const next =
        el.value.slice(0, bracePos) + inserted + el.value.slice(cursorPos);
      onChange(next);
      const newCursor = bracePos + inserted.length;
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(newCursor, newCursor);
      });
      setAutocompleteVisible(false);
      setAutocompleteIndex(0);
    },
    [onChange]
  );

  // Handle textarea changes — detect autocomplete trigger
  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
    const prefix = getAutocompletePrefix(
      e.target.value,
      e.target.selectionStart ?? 0
    );
    if (prefix !== null) {
      setAutocompleteVisible(true);
      setAutocompleteIndex(0);
    } else {
      setAutocompleteVisible(false);
    }
  }

  // Keyboard navigation for autocomplete
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!autocompleteVisible || filteredForAutocomplete.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAutocompleteIndex((i) => (i + 1) % filteredForAutocomplete.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAutocompleteIndex(
        (i) => (i - 1 + filteredForAutocomplete.length) % filteredForAutocomplete.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredForAutocomplete[autocompleteIndex];
      if (selected) completeAutocomplete(selected.name);
    } else if (e.key === "Escape") {
      setAutocompleteVisible(false);
    }
  }

  // Dismiss autocomplete on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setAutocompleteVisible(false);
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  if (variables.length === 0) {
    return (
      <div ref={rootRef} className={style.root}>
        <div className={style.textareaWrapper}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={style.textarea}
          />
        </div>
        {value && (
          <div className={style.previewStrip}>
            <p className={style.previewLabel}>Preview</p>
            {renderPreview(previewText)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={style.root}>
      {/* Toolbar */}
      <div className={style.toolbar}>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className={style.insertBtn}
            onClick={() => {
              setPickerOpen((o) => !o);
              setPickerSearch("");
            }}
          >
            {"{x}"} Insert Variable
          </button>

          {/* Variable picker popover */}
          {pickerOpen && (
            <>
              <div
                className={style.pickerOverlay}
                onClick={() => setPickerOpen(false)}
              />
              <div className={style.picker}>
                <div className={style.pickerSearch}>
                  <input
                    autoFocus
                    placeholder="Search variables…"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                  />
                </div>
                <div className={style.pickerList}>
                  {filteredForPicker.length === 0 ? (
                    <p className={style.pickerEmpty}>No variables found</p>
                  ) : (
                    filteredForPicker.map((v: ProjectVariable) => (
                      <div
                        key={v.id}
                        className={style.pickerItem}
                        onClick={() => insertAtCursor(v.name)}
                      >
                        <span className={style.autocompleteVarName}>{v.name}</span>
                        <TypeBadge type={v.type} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Textarea with autocomplete */}
      <div className={style.textareaWrapper}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className={style.textarea}
        />

        {/* Autocomplete dropdown */}
        {autocompleteVisible && filteredForAutocomplete.length > 0 && (
          <div className={style.autocomplete}>
            {filteredForAutocomplete.map((v: ProjectVariable, i: number) => (
              <div
                key={v.id}
                className={cn(
                  style.autocompleteItem,
                  i === autocompleteIndex && style.active
                )}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent textarea blur
                  completeAutocomplete(v.name);
                }}
              >
                <span className={style.autocompleteVarName}>{v.name}</span>
                <TypeBadge type={v.type} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live preview strip */}
      {value && (
        <div className={style.previewStrip}>
          <p className={style.previewLabel}>Preview</p>
          {renderPreview(previewText)}
        </div>
      )}
    </div>
  );
}
