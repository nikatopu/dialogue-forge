"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import cn from "classnames";
import { ArrowLeft, Check, Circle, RotateCcw, Trash2 } from "lucide-react";
import {
  clearCapturedEvents,
  getCapturedEvents,
  subscribeToCapture,
  type CapturedEvent,
} from "@/lib/analytics/devCapture";
import { getTransportStatus, type TransportStatus } from "@/lib/analytics";
import { getStoredAttribution, type Attribution } from "@/lib/analytics/attribution";
import { resetMilestones } from "@/lib/analytics/milestones";
import { resetVisits } from "@/lib/analytics/session";
import { clearAnonymousId } from "@/lib/analytics/anonymousId";
import { FUNNEL_STEPS } from "./funnelSteps";
import style from "./AnalyticsDevPanel.module.scss";

/**
 * Everything on this page is browser state, and all three reads are wired
 * through the capture subscription: the reset button clears the log, which
 * notifies, which re-reads the transport status and attribution too.
 */
const EMPTY_EVENTS: CapturedEvent[] = [];
const NO_STATUS: TransportStatus | null = null;
const NO_ATTRIBUTION: Attribution | null = null;

/**
 * Development-only capture view.
 *
 * Everything `track()` records shows up here whether or not a PostHog key is
 * configured, so the eight activation events can be walked through and verified
 * locally — which is the acceptance criterion for this funnel.
 */
export function AnalyticsDevPanel() {
  const events = useSyncExternalStore(subscribeToCapture, getCapturedEvents, () => EMPTY_EVENTS);
  const status = useSyncExternalStore(subscribeToCapture, getTransportStatus, () => NO_STATUS);
  const attribution = useSyncExternalStore(subscribeToCapture, getStoredAttribution, () => NO_ATTRIBUTION);

  const fired = new Set(events.map((e) => e.event));

  function resetFunnel() {
    resetMilestones();
    resetVisits();
    clearAnonymousId();
    // Last, because clearing the log is what notifies the reads above.
    clearCapturedEvents();
  }

  return (
    <div className={style.page}>
      <header className={style.header}>
        <Link href="/" className={style.back}>
          <ArrowLeft size={14} />
          Landing
        </Link>
        <h1 className={style.title}>Analytics capture</h1>
        <span className={style.badge}>development only</span>

        <div className={style.headerActions}>
          <button type="button" onClick={() => clearCapturedEvents()} className={style.actionBtn}>
            <Trash2 size={13} />
            Clear log
          </button>
          <button type="button" onClick={resetFunnel} className={style.actionBtn}>
            <RotateCcw size={13} />
            Reset funnel state
          </button>
        </div>
      </header>

      <TransportCard status={status} attribution={attribution} />

      <section className={style.section}>
        <h2 className={style.sectionTitle}>
          Funnel coverage
          <span className={style.counter}>{fired.size} / {FUNNEL_STEPS.length}</span>
        </h2>
        <ol className={style.steps}>
          {FUNNEL_STEPS.map((step) => (
            <li key={step.event} className={cn(style.step, fired.has(step.event) && style.stepDone)}>
              <span className={style.stepIcon}>
                {fired.has(step.event) ? <Check size={12} /> : <Circle size={9} />}
              </span>
              <div className={style.stepBody}>
                <code className={style.stepEvent}>{step.event}</code>
                <p className={style.stepHow}>{step.how}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={style.section}>
        <h2 className={style.sectionTitle}>
          Event log
          <span className={style.counter}>{events.length}</span>
        </h2>
        {events.length === 0 ? (
          <p className={style.empty}>
            Nothing captured yet in this browser session. Walk the funnel above, then come back.
          </p>
        ) : (
          <ul className={style.log}>
            {[...events].reverse().map((entry, i) => (
              <LogRow key={`${entry.at}-${i}`} entry={entry} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TransportCard({ status, attribution }: { status: TransportStatus | null; attribution: Attribution | null }) {
  if (!status) return null;

  const transport = status.optedOut
    ? { label: "Disabled — Do-Not-Track / GPC", tone: "warn" as const }
    : status.live
    ? { label: "Live — sending to PostHog", tone: "ok" as const }
    : status.configured
    ? { label: "Configured, not yet loaded", tone: "warn" as const }
    : { label: "Local only — no key, or not production", tone: "idle" as const };

  return (
    <section className={style.section}>
      <h2 className={style.sectionTitle}>Transport</h2>
      <dl className={style.facts}>
        <Fact label="Status">
          <span className={cn(style.pill, style[transport.tone])}>{transport.label}</span>
        </Fact>
        <Fact label="Anonymous id">
          <code className={style.mono}>{status.anonymousId ?? "unavailable"}</code>
        </Fact>
        <Fact label="First-touch source">
          {attribution ? (
            <code className={style.mono}>
              {Object.entries(attribution).map(([k, v]) => `${k}=${v}`).join("  ")}
            </code>
          ) : (
            <span className={style.muted}>direct — no UTM parameters seen</span>
          )}
        </Fact>
      </dl>
      <p className={style.hint}>
        Add <code className={style.mono}>?utm_source=test&utm_campaign=demo</code> to the landing URL
        in a fresh browser profile to exercise attribution.
      </p>
    </section>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={style.fact}>
      <dt className={style.factLabel}>{label}</dt>
      <dd className={style.factValue}>{children}</dd>
    </div>
  );
}

function LogRow({ entry }: { entry: CapturedEvent }) {
  const time = new Date(entry.at).toLocaleTimeString();
  const props = Object.entries(entry.props);

  return (
    <li className={style.logRow}>
      <span className={style.logTime}>{time}</span>
      <code className={style.logEvent}>{entry.event}</code>
      <span className={style.logProps}>
        {props.length === 0
          ? <span className={style.muted}>no props</span>
          : props.map(([key, value]) => (
              <span key={key} className={style.prop}>
                {key}=<strong>{String(value)}</strong>
              </span>
            ))}
      </span>
      <span className={cn(style.logSink, entry.sent ? style.ok : style.idle)}>
        {entry.sent ? "sent" : "local"}
      </span>
    </li>
  );
}
