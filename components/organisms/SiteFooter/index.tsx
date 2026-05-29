import Link from "next/link";
import style from "./SiteFooter.module.scss";

export function SiteFooter() {
  return (
    <footer className={style.footer}>
      <div className={style.container}>
        <p className={style.copyright}>
          &copy; {new Date().getFullYear()} Dialogue Forge. All rights reserved.
        </p>
        <nav className={style.nav}>
          <Link href="/privacy" className={style.link}>Privacy Policy</Link>
          <span className={style.separator}>·</span>
          <Link href="/terms" className={style.link}>Terms of Service</Link>
        </nav>
      </div>
    </footer>
  );
}
