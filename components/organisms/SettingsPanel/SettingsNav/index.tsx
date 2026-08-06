"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import cn from "classnames";
import { NAV_ITEMS, type SettingsSection } from "../settingsConfig";
import style from "./SettingsNav.module.scss";

type SettingsNavProps = {
  section: SettingsSection;
  onSelect: (id: SettingsSection) => void;
};

export function SettingsNav({ section, onSelect }: SettingsNavProps) {
  return (
    <motion.aside
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -16, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className={style.nav}
    >
      <div className={style.navLogo}>
        <div className={style.navLogoIcon}><Settings size={12} className={style.navLogoGlyph} /></div>
        <span className={style.navLogoText}>Settings</span>
      </div>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(style.navItem, section === item.id && style.navItemActive)}
          >
            <Icon size={14} />
            {item.label}
          </button>
        );
      })}
    </motion.aside>
  );
}
