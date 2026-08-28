import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cn from "classnames";
import { SOCIAL_LINKS } from "@/lib/socialLinks";
import style from "./SocialLinks.module.scss";

interface SocialLinksProps {
  className?: string;
}

/** Renders every live entry from `lib/socialLinks.ts` — one without an `href` yet is skipped. */
export function SocialLinks({ className }: SocialLinksProps) {
  const links = SOCIAL_LINKS.filter((link) => link.href);
  if (links.length === 0) return null;

  return (
    <div className={cn(style.social, className)}>
      {links.map(({ name, href, icon }) => (
        <a
          key={name}
          href={href!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          className={style.iconLink}
        >
          <FontAwesomeIcon icon={icon} className={style.icon} />
        </a>
      ))}
    </div>
  );
}
