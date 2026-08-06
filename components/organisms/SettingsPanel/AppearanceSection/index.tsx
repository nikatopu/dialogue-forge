"use client";

import { Check } from "lucide-react";
import cn from "classnames";
import { useEditorStore } from "@/store/useEditorStore";
import { applyTheme } from "@/lib/applyTheme";
import { THEMES, THEME_SWATCH_COLORS, MODES } from "../settingsConfig";
import sections from "../sections.module.scss";
import style from "./AppearanceSection.module.scss";

export function AppearanceSection() {
  const { theme, setTheme, mode, setMode } = useEditorStore();
  const swatches = THEME_SWATCH_COLORS[mode];

  return (
    <div>
      <div className={sections.sectionHeader}><h2 className={sections.sectionTitle}>Appearance</h2></div>

      <h3 className={sections.subsectionTitle}>Mode</h3>
      <p className={sections.subsectionDesc}>Every color theme comes in both. Dark is the default.</p>
      <div className={style.modeRow}>
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => { setMode(m.value); applyTheme(theme, m.value); }}
              aria-pressed={active}
              className={cn(style.themeBtn, active && style.themeBtnActive)}
            >
              <span className={cn(style.modeIcon, active && style.modeIconActive)}><Icon size={14} /></span>
              <div>
                <p className={style.themeName}>{m.label}</p>
                <p className={style.themeDesc}>{m.description}</p>
              </div>
              {active && <Check size={12} className={style.themeCheck} />}
            </button>
          );
        })}
      </div>

      <h3 className={cn(sections.subsectionTitle, style.themeHeading)}>Color Theme</h3>
      <p className={sections.subsectionDesc}>The accent color changes throughout the editor.</p>
      <div className={style.themeGrid}>
        {THEMES.map((t) => (
          <button key={t.value} type="button" onClick={() => { setTheme(t.value); applyTheme(t.value, mode); }} className={cn(style.themeBtn, theme === t.value && style.themeBtnActive)}>
            <span className={cn(style.themeSwatch, theme === t.value && style.themeSwatchActive)} style={{ backgroundColor: swatches[t.value] }} />
            <div>
              <p className={style.themeName}>{t.label}</p>
              <p className={style.themeDesc}>{t.description}</p>
            </div>
            {theme === t.value && <Check size={12} className={style.themeCheck} />}
          </button>
        ))}
      </div>
    </div>
  );
}
