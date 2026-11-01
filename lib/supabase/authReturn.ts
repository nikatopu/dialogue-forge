/**
 * Where to send the user after OAuth sign-in.
 *
 * The page they signed in from travels in a short-lived cookie rather than
 * as a `?next=` query param on `redirectTo`. Supabase only honors a
 * `redirectTo` that matches its Redirect URLs allow-list, and an entry like
 * `https://www.dialogueforge.org/auth/callback` does not match the same URL
 * with a query string appended. A rejected `redirectTo` silently falls back
 * to the Site URL, so the auth code lands on "/" and the sign-in is lost.
 * Keeping `redirectTo` a bare `/auth/callback` avoids that entirely.
 */

export const AUTH_RETURN_COOKIE = "df-auth-return";

/** Query param /auth/callback adds when sign-in failed, read by <AuthErrorNotice>. */
export const AUTH_ERROR_PARAM = "auth_error";

/**
 * Only ever a same-site relative path. The value comes from a cookie or
 * query param the user (or an attacker) controls, so "//evil.com",
 * "/\\evil.com" (which browsers also read as protocol-relative), and
 * absolute URLs all collapse to "/".
 */
export function safeReturnPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return "/";
  }
  return raw;
}
