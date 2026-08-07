import Link from "next/link";
import { CookiePreferencesLink } from "./CookiePreferencesLink";
import style from "./SiteFooter.module.scss";

export function SiteFooter() {
  return (
    <footer className={style.footer}>
      <div className={style.container}>
        <p className={style.copyright}>
          &copy; {new Date().getFullYear()} Dialogue Forge. All rights reserved.
        </p>
        <nav className={style.nav}>
          <Link href="/support" className={style.link}>Support</Link>
          <span className={style.separator}>·</span>
          <Link href="/privacy" className={style.link}>Privacy Policy</Link>
          <span className={style.separator}>·</span>
          <Link href="/terms" className={style.link}>Terms of Service</Link>
          <span className={style.separator}>·</span>
          <CookiePreferencesLink className={style.link} />
        </nav>
      </div>
    </footer>
  );
}
