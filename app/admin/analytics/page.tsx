"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useProjectStore } from "@/store/useProjectStore";
import { cn } from "@/lib/utils";
import type { AnalyticsEvent } from "@/lib/analytics/analyticsService";

/* ─── Types ───────────────────────────────────────────────── */

interface EventRow {
  event: AnalyticsEvent;
  count: number;
}

interface DayStat {
  day: string;
  count: number;
}

interface AnalyticsData {
  totalEvents: number;
  uniqueUsers: number;
  eventCounts: EventRow[];
  last7Days: DayStat[];
  nodeTypes: Array<{ type: string; count: number }>;
}

/* ─── Helpers ─────────────────────────────────────────────── */

const EVENT_GROUPS: { label: string; events: AnalyticsEvent[] }[] = [
  { label: "Sign-ins", events: ["sign_in"] },
  { label: "Projects created", events: ["project_created"] },
  { label: "Projects exported", events: ["project_exported"] },
  { label: "Cloud saves", events: ["project_cloud_saved"] },
  { label: "Preview runs", events: ["preview_started"] },
  { label: "Templates used", events: ["template_loaded", "template_inserted", "template_replaced"] },
  { label: "Mobile sessions", events: ["mobile_user"] },
  { label: "Desktop sessions", events: ["desktop_user"] },
];

function statFor(eventCounts: EventRow[], events: AnalyticsEvent[]): number {
  return eventCounts
    .filter((r) => events.includes(r.event))
    .reduce((sum, r) => sum + r.count, 0);
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ─── Page ────────────────────────────────────────────────── */

export default function AnalyticsDashboard() {
  const { user, isAuthLoading } = useProjectStore();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      // All events for grouping
      const { data: events, error: eventsErr } = await supabase
        .from("analytics_events")
        .select("event, user_id, metadata, created_at");

      if (eventsErr) throw eventsErr;
      if (!events) throw new Error("No data");

      // Count by event
      const countMap: Record<string, number> = {};
      for (const row of events) {
        countMap[row.event] = (countMap[row.event] ?? 0) + 1;
      }
      const eventCounts: EventRow[] = Object.entries(countMap)
        .map(([event, count]) => ({ event: event as AnalyticsEvent, count }))
        .sort((a, b) => b.count - a.count);

      // Unique users
      const uniqueUsers = new Set(events.map((e) => e.user_id).filter(Boolean)).size;

      // Last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
      const dayMap: Record<string, number> = {};
      for (const row of events) {
        const d = new Date(row.created_at);
        if (d < sevenDaysAgo) continue;
        const key = d.toISOString().slice(0, 10);
        dayMap[key] = (dayMap[key] ?? 0) + 1;
      }
      const last7Days: DayStat[] = Object.entries(dayMap)
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => a.day.localeCompare(b.day));

      // Node type distribution from node_type_created metadata
      const nodeTypeMap: Record<string, number> = {};
      for (const row of events) {
        if (row.event === "node_type_created" && row.metadata && typeof row.metadata === "object") {
          const meta = row.metadata as Record<string, unknown>;
          const t = String(meta.type ?? "unknown");
          nodeTypeMap[t] = (nodeTypeMap[t] ?? 0) + 1;
        }
      }
      const nodeTypes = Object.entries(nodeTypeMap)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      setData({ totalEvents: events.length, uniqueUsers, eventCounts, last7Days, nodeTypes });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && user) fetchData();
    if (!isAuthLoading && !user) setLoading(false);
  }, [isAuthLoading, user, fetchData]);

  /* ── Auth guard ── */
  if (!isAuthLoading && !user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
        <ShieldAlert className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm font-semibold">Access restricted</p>
        <p className="text-xs text-muted-foreground">Sign in to view analytics.</p>
        <Link href="/">
          <Button size="sm" variant="outline">Back to editor</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="h-14 flex items-center gap-3 px-5 border-b border-border/60">
        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Editor
        </Link>
        <div className="w-px h-4 bg-border/60" />
        <h1 className="text-sm font-semibold">Analytics</h1>
        <div className="flex-1" />
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </header>

      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-center">
            <p className="text-sm font-semibold">Failed to load analytics</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button size="sm" variant="outline" onClick={fetchData} className="mt-2">Retry</Button>
          </div>
        ) : data ? (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Total events" value={data.totalEvents} />
              <StatCard label="Unique users" value={data.uniqueUsers} />
              <StatCard label="Projects created" value={statFor(data.eventCounts, ["project_created"])} />
              <StatCard label="Preview runs" value={statFor(data.eventCounts, ["preview_started"])} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Cloud saves" value={statFor(data.eventCounts, ["project_cloud_saved"])} />
              <StatCard label="Exports" value={statFor(data.eventCounts, ["project_exported"])} />
              <StatCard label="Templates used" value={statFor(data.eventCounts, ["template_loaded", "template_inserted", "template_replaced"])} />
              <StatCard
                label="Mobile %"
                value={
                  (() => {
                    const m = statFor(data.eventCounts, ["mobile_user"]);
                    const d = statFor(data.eventCounts, ["desktop_user"]);
                    const total = m + d;
                    return total === 0 ? "—" : `${Math.round((m / total) * 100)}%`;
                  })()
                }
              />
            </div>

            {/* Activity — last 7 days */}
            {data.last7Days.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Activity — last 7 days
                </h2>
                <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                  <ActivityChart data={data.last7Days} />
                </div>
              </section>
            )}

            {/* Event breakdown */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Event breakdown
              </h2>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                {EVENT_GROUPS.map(({ label, events }, i) => {
                  const count = statFor(data.eventCounts, events);
                  const max = Math.max(...EVENT_GROUPS.map(({ events: e }) => statFor(data.eventCounts, e)), 1);
                  return (
                    <div
                      key={label}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3",
                        i !== EVENT_GROUPS.length - 1 && "border-b border-border/30"
                      )}
                    >
                      <span className="text-xs text-muted-foreground w-36 shrink-0">{label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/50 transition-all"
                          style={{ width: `${Math.round((count / max) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Node type distribution */}
            {data.nodeTypes.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Node types created
                </h2>
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  {data.nodeTypes.map(({ type, count }, i) => {
                    const max = Math.max(...data.nodeTypes.map((n) => n.count), 1);
                    return (
                      <div
                        key={type}
                        className={cn(
                          "flex items-center gap-4 px-4 py-3",
                          i !== data.nodeTypes.length - 1 && "border-b border-border/30"
                        )}
                      >
                        <span className="text-xs text-muted-foreground w-24 shrink-0 capitalize">{type}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-violet-500/50 transition-all"
                            style={{ width: `${Math.round((count / max) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium tabular-nums w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Raw event counts */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                All events
              </h2>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                {data.eventCounts.map(({ event, count }, i) => (
                  <div
                    key={event}
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5",
                      i !== data.eventCounts.length - 1 && "border-b border-border/30"
                    )}
                  >
                    <code className="text-[11px] text-muted-foreground font-mono">{event}</code>
                    <span className="text-xs font-medium tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────── */

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 p-4">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function ActivityChart({ data }: { data: DayStat[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map(({ day, count }) => (
        <div key={day} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <div className="w-full flex items-end justify-center" style={{ height: "72px" }}>
            <div
              className="w-full rounded-sm bg-primary/40 hover:bg-primary/60 transition-colors"
              style={{ height: `${Math.max(4, Math.round((count / max) * 72))}px` }}
              title={`${count} events`}
            />
          </div>
          <span className="text-[9px] text-muted-foreground truncate w-full text-center">
            {formatDay(day)}
          </span>
        </div>
      ))}
    </div>
  );
}
