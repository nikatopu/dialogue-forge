"use client";

import { useEffect } from "react";
import { toast } from "@/lib/toast";
import { AUTH_ERROR_PARAM } from "@/lib/supabase/authReturn";

/**
 * /auth/callback sends a failed sign-in back to the page it started on with
 * `?auth_error=1`. Mounted in the root layout so that works for any page:
 * show one toast, then strip the param so a reload doesn't repeat it.
 */
export function AuthErrorNotice() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(AUTH_ERROR_PARAM)) return;

    toast.error("Sign-in didn't complete. Please try again, or contact support if it keeps happening.");
    url.searchParams.delete(AUTH_ERROR_PARAM);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, []);

  return null;
}
