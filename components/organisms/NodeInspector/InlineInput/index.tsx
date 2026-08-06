"use client";

import { useState, useEffect, useRef } from "react";
import fields from "../fields.module.scss";

type InlineInputProps = {
  value: string;
  placeholder?: string;
  suggestions?: string[];
  onCommit: (v: string) => void;
};

export function InlineInput({ value, placeholder, suggestions, onCommit }: InlineInputProps) {
  const [local, setLocal] = useState(value);
  const dirty = useRef(false);
  const listId = useRef(`dl-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => { if (!dirty.current) setLocal(value); }, [value]);

  return (
    <>
      <input
        value={local}
        list={suggestions && suggestions.length > 0 ? listId : undefined}
        onChange={(e) => { dirty.current = true; setLocal(e.target.value); }}
        onBlur={() => { onCommit(local); dirty.current = false; }}
        onKeyDown={(e) => { if (e.key === "Enter") { onCommit(local); dirty.current = false; } }}
        placeholder={placeholder}
        className={fields.inlineInput}
      />
      {suggestions && suggestions.length > 0 && (
        <datalist id={listId}>{suggestions.map((s) => <option key={s} value={s} />)}</datalist>
      )}
    </>
  );
}
