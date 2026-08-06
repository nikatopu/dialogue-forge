"use client";

import cn from "classnames";
import style from "./MenuItem.module.scss";

type MenuItemProps = {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  href?: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

export function MenuItem({ icon: Icon, label, href, onClick, destructive, disabled }: MenuItemProps) {
  const cls = cn(style.menuItem, destructive && style.menuItemDestructive);

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>
        <Icon size={14} />
        {label}
      </a>
    );
  }

  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled}>
      <Icon size={14} />
      {label}
    </button>
  );
}
