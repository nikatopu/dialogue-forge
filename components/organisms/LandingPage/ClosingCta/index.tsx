import Link from "next/link";
import { ArrowRight } from "lucide-react";
import style from "./ClosingCta.module.scss";

export function ClosingCta() {
  return (
    <section className={style.section}>
      <div className={style.panel}>
        <h2 className={style.title}>Open the canvas and start writing</h2>
        <p className={style.subtitle}>
          No sign-up, no trial, no export paywall. The editor is right there.
        </p>
        <div className={style.actions}>
          <Link href="/editor" className={style.primaryCta}>
            Open the editor
            <ArrowRight size={15} />
          </Link>
          <Link href="/how-to-use" className={style.secondaryCta}>
            Read the guide
          </Link>
        </div>
      </div>
    </section>
  );
}
