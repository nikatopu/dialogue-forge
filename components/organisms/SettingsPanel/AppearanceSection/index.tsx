"use client";

import { Check } from "lucide-react";
import cn from "classnames";
import { useEditorStore } from "@/store/useEditorStore";
import { applyTheme } from "@/lib/applyTheme";
import { THEMES, THEME_SWATCH_COLORS } from "../settingsConfig";
import sections from "../sections.module.scss";
import style from "./AppearanceSection.module.scss";

export function AppearanceSection() {
  const { theme, setTheme } = useEditorStore();
  return (
    <div>
      <div className={sections.sectionHeader}><h2 className={sections.sectionTitle}>Appearance</h2></div>
      <h3 className={sections.subsectionTitle}>Color Theme</h3>
      <p className={sections.subsectionDesc}>All themes are dark variants. The accent color changes throughout the editor.</p>
      <div className={style.themeGrid}>
        {THEMES.map((t) => (
          <button key={t.value} type="button" onClick={() => { setTheme(t.value); applyTheme(t.value); }} className={cn(style.themeBtn, theme === t.value && style.themeBtnActive)}>
            <span className={cn(style.themeSwatch, theme === t.value && style.themeSwatchActive)} style={{ backgroundColor: THEME_SWATCH_COLORS[t.value] }} />
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
