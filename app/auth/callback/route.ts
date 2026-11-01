import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AUTH_ERROR_PARAM, AUTH_RETURN_COOKIE, safeReturnPath } from "@/lib/supabase/authReturn";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  // Supabase/the provider report failures (e.g. the user cancelled the
  // consent screen) as error params instead of a code.
  const providerError = searchParams.get("error_description") ?? searchParams.get("error");
  // `?next=` is still accepted for links issued before the cookie existed.
  const next = safeReturnPath(
    request.cookies.get(AUTH_RETURN_COOKIE)?.value ?? searchParams.get("next"),
  );

  let failure = providerError ?? "missing auth code";

  if (code && !providerError) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      response.cookies.delete(AUTH_RETURN_COOKIE);
      return response;
    }
    failure = error.message;
  }

  // Logged so failures show up in the Vercel function logs — the user only
  // ever sees a generic toast.
  console.error("[auth/callback] sign-in failed:", failure);

  const separator = next.includes("?") ? "&" : "?";
  const response = NextResponse.redirect(`${origin}${next}${separator}${AUTH_ERROR_PARAM}=1`);
  response.cookies.delete(AUTH_RETURN_COOKIE);
  return response;
}
