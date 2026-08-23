"use client";

/**
 * Once-per-visitor activation milestones.
 *
 * `first_node_added` and `first_branch_created` describe a person crossing a
 * threshold, not a repeatable action — firing them on every node or branch
 * would make the funnel meaningless. The set of milestones already reached is
 * kept in localStorage so it survives reloads and project switches.
 */

const MILESTONE_KEY = "dialogue-forge-analytics-milestones";

export type Milestone = "first_node_added" | "first_branch_created";

function read(): Set<Milestone> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(MILESTONE_KEY);
    return new Set(raw ? (JSON.parse(raw) as Milestone[]) : []);
  } catch {
    return new Set();
  }
}

function write(reached: Set<Milestone>): void {
  try {
    window.localStorage.setItem(MILESTONE_KEY, JSON.stringify([...reached]));
  } catch {
    /* storage unavailable — the milestone may repeat, which is preferable to throwing */
  }
}

/**
 * Claims a milestone, returning true only for the caller that got there first.
 *
 * The write happens before the caller fires its event, so two near-simultaneous
 * callers (e.g. a store subscription and a click handler) cannot both win.
 */
export function claimMilestone(milestone: Milestone): boolean {
  if (typeof window === "undefined") return false;
  const reached = read();
  if (reached.has(milestone)) return false;
  reached.add(milestone);
  write(reached);
  return true;
}

export function hasMilestone(milestone: Milestone): boolean {
  return read().has(milestone);
}

/** Dev capture view only — lets a tester replay the activation funnel. */
export function resetMilestones(): void {
  try {
    window.localStorage.removeItem(MILESTONE_KEY);
  } catch {
    /* nothing to reset */
  }
}
