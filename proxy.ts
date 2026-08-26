import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isProductionHost } from "@/lib/productionHost";

// Routes where auth state actually matters server-side. Everything else —
// the landing page, roadmap, support, legal pages, how-to-use — is public
// and renders the same for everyone, so it has no reason to spend a
// Supabase Auth API call refreshing a session on every request/prefetch.
const AUTH_AWARE_PREFIXES = ["/editor", "/projects", "/auth"];

function isAuthAwarePath(pathname: string): boolean {
  return AUTH_AWARE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (isAuthAwarePath(request.nextUrl.pathname)) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // Refresh session — required for Server Components to read auth state
    await supabase.auth.getUser();
  }

  // staging.dialogueforge.org and any other non-production host (Vercel
  // preview URLs, localhost) get a hard noindex, regardless of what a
  // page's own metadata says. Same build on both branches — the domain is
  // the only thing that tells them apart.
  if (!isProductionHost(request.headers.get("host"))) {
    supabaseResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Exclude static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
