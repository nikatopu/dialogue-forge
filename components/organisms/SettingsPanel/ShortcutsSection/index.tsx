"use client";

import { SHORTCUTS } from "../settingsConfig";
import sections from "../sections.module.scss";
import style from "./ShortcutsSection.module.scss";

export function ShortcutsSection() {
  return (
    <div>
      <div className={sections.sectionHeader}><h2 className={sections.sectionTitle}>Shortcuts</h2></div>
      <div className={style.shortcutsTable}>
        {SHORTCUTS.map((s) => (
          <div key={s.label} className={style.shortcutRow}>
            <span className={style.shortcutLabel}>{s.label}</span>
            <div className={style.shortcutKeys}>{s.keys.map((k) => <kbd key={k} className={style.kbd}>{k}</kbd>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
