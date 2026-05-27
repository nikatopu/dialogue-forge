import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-background/80">
      <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground/60 tabular-nums">
          &copy; {new Date().getFullYear()} Dialogue Forge. All rights reserved.
        </p>
        <nav className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-muted-foreground/20 select-none">·</span>
          <Link
            href="/terms"
            className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
