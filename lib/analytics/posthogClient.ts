"use client";

/**
 * PostHog transport for the activation funnel.
 *
 * Configured to be cookieless and quiet: persistence is localStorage, so no
 * cookie is ever written and the banner does not gate it; autocapture, session
 * recording, surveys and automatic pageviews are all off, so the only thing
 * that reaches PostHog is an event this codebase deliberately tracked.
 *
 * Loading rules — all must hold, or the SDK is never even imported:
 *   1. NEXT_PUBLIC_ANALYTICS_KEY is set
 *   2. NODE_ENV is production (or NEXT_PUBLIC_ANALYTICS_DEBUG=1 for local checks)
 *   3. the visitor has not asked not to be tracked (DNT / GPC)
 */

import type { PostHog } from "posthog-js";
import type { Attribution } from "./attribution";

const KEY = process.env.NEXT_PUBLIC_ANALYTICS_KEY;
const HOST = process.env.NEXT_PUBLIC_ANALYTICS_HOST ?? "https://eu.i.posthog.com";
const DEBUG = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "1";

/** PostHog EU's dashboard origin, so the toolbar links to the right region. */
const UI_HOST = "https://eu.posthog.com";

type NavigatorPrivacySignals = Navigator & {
  /** Non-standard, still shipped by some browsers. */
  msDoNotTrack?: string;
  /** Global Privacy Control — a legally recognised opt-out signal. */
  globalPrivacyControl?: boolean;
};

/**
 * True when the browser carries an opt-out signal. Both Do-Not-Track and GPC
 * are honoured; either one disables the transport completely.
 */
export function hasOptOutSignal(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as NavigatorPrivacySignals;
  const dnt =
    nav.doNotTrack ??
    (window as unknown as { doNotTrack?: string }).doNotTrack ??
    nav.msDoNotTrack;
  return dnt === "1" || dnt === "yes" || nav.globalPrivacyControl === true;
}

/** Whether a transport could run at all, ignoring the visitor's own signal. */
export function isTransportConfigured(): boolean {
  return Boolean(KEY) && (process.env.NODE_ENV === "production" || DEBUG);
}

/**
 * Query strings can carry anything an inbound link chose to put there, so URLs
 * are reduced to origin + path before they leave the browser. UTM parameters
 * are already captured separately as explicit properties.
 */
function stripQuery(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return value;
  }
}

let client: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;

async function load(anonymousId: string): Promise<PostHog | null> {
  const { default: posthog } = await import("posthog-js");

  posthog.init(KEY as string, {
    api_host: HOST,
    ui_host: UI_HOST,

    // Cookieless: localStorage only, so nothing is written to document.cookie.
    persistence: "localStorage",

    // Our own anonymous id is the distinct id. No $identify call is ever made,
    // so PostHog never links this profile to a person.
    bootstrap: { distinctID: anonymousId },

    // Person profiles are on so first-touch UTM data can be attached to the
    // anonymous profile — that profile holds campaign labels and nothing else.
    person_profiles: "always",

    // Everything implicit is off. Autocapture in particular would hoover up the
    // text content of clicked elements, which here means dialogue the user wrote.
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    disable_surveys: true,

    property_denylist: ["$ip"],

    before_send: (event) => {
      if (!event) return null;
      const properties = { ...event.properties };
      properties.$ip = null; // suppress server-side IP capture and geolocation
      properties.$current_url = stripQuery(properties.$current_url);
      properties.$referrer = stripQuery(properties.$referrer);
      delete properties.$initial_current_url;
      delete properties.$initial_referrer;
      return { ...event, properties };
    },

    loaded: (instance) => {
      if (DEBUG) instance.debug();
    },
  });

  client = posthog;
  return posthog;
}

/**
 * Boots the transport if it is allowed to run. Safe to call repeatedly — the
 * SDK is imported at most once, and the dynamic import keeps it out of the
 * main bundle for visitors who never load it.
 */
export function ensurePostHog(anonymousId: string): Promise<PostHog | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!isTransportConfigured() || hasOptOutSignal()) return Promise.resolve(null);
  if (!loading) loading = load(anonymousId).catch(() => null);
  return loading;
}

/** The live client, or null when the transport never started. */
export function getPostHog(): PostHog | null {
  return client;
}

/**
 * Attaches first-touch campaign labels to the anonymous profile.
 *
 * `register_once` puts them on every subsequent event so a funnel can be
 * segmented by source; `setPersonProperties` writes them to the profile with
 * $set_once semantics, so a later visit never overwrites the original source.
 */
export function setAttributionProperties(attribution: Attribution): void {
  if (!client || Object.keys(attribution).length === 0) return;
  client.register_once({ ...attribution });
  client.setPersonProperties(undefined, { ...attribution });
}
