"use client";

import { useDialogueAutocomplete } from "./useDialogueAutocomplete";
import { VariablePicker } from "./VariablePicker";
import { AutocompleteDropdown } from "./AutocompleteDropdown";
import { PreviewStrip } from "./PreviewStrip";
import style from "./DialogueVariableEditor.module.scss";

interface DialogueVariableEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function DialogueVariableEditor({ value, onChange, placeholder, rows = 3 }: DialogueVariableEditorProps) {
  const s = useDialogueAutocomplete(value, onChange);
  const hasVariables = s.variables.length > 0;

  return (
    <div ref={s.rootRef} className={style.root}>
      {hasVariables && (
        <VariablePicker
          open={s.pickerOpen}
          onToggle={() => { s.setPickerOpen((o) => !o); s.setPickerSearch(""); }}
          onClose={() => s.setPickerOpen(false)}
          search={s.pickerSearch}
          onSearchChange={s.setPickerSearch}
          items={s.filteredForPicker}
          onSelect={s.insertAtCursor}
        />
      )}

      <div className={style.textareaWrapper}>
        <textarea
          ref={s.textareaRef}
          value={value}
          onChange={hasVariables ? s.handleTextareaChange : (e) => onChange(e.target.value)}
          onKeyDown={hasVariables ? s.handleKeyDown : undefined}
          placeholder={placeholder}
          rows={rows}
          className={style.textarea}
        />
        {hasVariables && s.autocompleteVisible && (
          <AutocompleteDropdown
            items={s.filteredForAutocomplete}
            activeIndex={s.autocompleteIndex}
            onSelect={s.completeAutocomplete}
          />
        )}
      </div>

      {value && <PreviewStrip text={s.previewText} />}
    </div>
  );
}
