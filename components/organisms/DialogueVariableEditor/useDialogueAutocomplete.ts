import { useRef, useState, useEffect, useCallback } from "react";
import { useVariableStore } from "@/store/useVariableStore";
import { interpolateText } from "@/lib/interpolation";
import type { RuntimeState } from "@/types";
import { getAutocompletePrefix } from "./dialogueEditorHelpers";

export function useDialogueAutocomplete(value: string, onChange: (v: string) => void) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const variables = useVariableStore((s) => s.variables);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [autocompleteVisible, setAutocompleteVisible] = useState(false);
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);

  const runtimeState: RuntimeState = Object.fromEntries(variables.map((v) => [v.name, v.defaultValue]));
  const previewText = value ? interpolateText(value, runtimeState) : "";

  const filteredForPicker = variables.filter((v) =>
    !pickerSearch || v.name.toLowerCase().includes(pickerSearch.toLowerCase()),
  );

  function getCurrentPrefix(): string | null {
    const el = textareaRef.current;
    if (!el) return null;
    return getAutocompletePrefix(el.value, el.selectionStart ?? 0);
  }

  const autocompletePrefix = autocompleteVisible ? getCurrentPrefix() : null;
  const filteredForAutocomplete = variables.filter((v) =>
    autocompletePrefix === null ? false : v.name.toLowerCase().startsWith(autocompletePrefix.toLowerCase()),
  );

  const insertAtCursor = useCallback((varName: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const inserted = `{${varName}}`;
    const next = el.value.slice(0, start) + inserted + el.value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + inserted.length, start + inserted.length);
    });
    setPickerOpen(false);
  }, [onChange]);

  const completeAutocomplete = useCallback((varName: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const cursorPos = el.selectionStart ?? el.value.length;
    const before = el.value.slice(0, cursorPos);
    const bracePos = before.lastIndexOf("{");
    if (bracePos === -1) return;
    const inserted = `{${varName}}`;
    const next = el.value.slice(0, bracePos) + inserted + el.value.slice(cursorPos);
    onChange(next);
    const newCursor = bracePos + inserted.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newCursor, newCursor);
    });
    setAutocompleteVisible(false);
    setAutocompleteIndex(0);
  }, [onChange]);

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
    const prefix = getAutocompletePrefix(e.target.value, e.target.selectionStart ?? 0);
    if (prefix !== null) {
      setAutocompleteVisible(true);
      setAutocompleteIndex(0);
    } else {
      setAutocompleteVisible(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!autocompleteVisible || filteredForAutocomplete.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAutocompleteIndex((i) => (i + 1) % filteredForAutocomplete.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAutocompleteIndex((i) => (i - 1 + filteredForAutocomplete.length) % filteredForAutocomplete.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredForAutocomplete[autocompleteIndex];
      if (selected) completeAutocomplete(selected.name);
    } else if (e.key === "Escape") {
      setAutocompleteVisible(false);
    }
  }

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

  return {
    textareaRef, rootRef, variables, previewText,
    pickerOpen, setPickerOpen, pickerSearch, setPickerSearch, filteredForPicker,
    autocompleteVisible, autocompleteIndex, filteredForAutocomplete,
    insertAtCursor, completeAutocomplete, handleTextareaChange, handleKeyDown,
  };
}
