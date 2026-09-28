import "server-only";
import { addMinutes } from "date-fns";
import type { Strategy, StrategyVersion } from "@/lib/types";
import type { SeedData } from "./seed";

/** A draft starts on its own this long after it was drafted (owner decision, 2026-09-25). */
export const AUTO_START_MINUTES = 30;

/** A draft past its 30 minutes becomes active with `approvedBy` null: it started on its own. */
export function settle(strategy: Strategy): Strategy {
  if (strategy.status === "draft" && Date.now() >= Date.parse(strategy.autoStartsAt)) {
    Object.assign(strategy, { status: "active", activatedAt: strategy.autoStartsAt, approvedBy: null });
  }
  return strategy;
}

const versionRow = (strategy: Strategy): StrategyVersion => ({
  version: strategy.version,
  status: strategy.status,
  generatedAt: strategy.generatedAt,
  activatedAt: strategy.activatedAt,
  approvedBy: strategy.approvedBy,
  changeNote: strategy.changeNote,
});

export function versions(db: SeedData, strategy: Strategy): StrategyVersion[] {
  return [versionRow(strategy), ...structuredClone(db.strategyHistory[strategy.clientId] ?? [])];
}

/** Writes the next version as a draft with a fresh 30 minutes; the current one moves to history. */
export function draftNext(db: SeedData, strategy: Strategy, changeNote: string | null): Strategy {
  const history = (db.strategyHistory[strategy.clientId] ??= []);
  history.unshift({ ...versionRow(strategy), status: "superseded" });
  const generatedAt = new Date();
  Object.assign(strategy, {
    version: strategy.version + 1,
    status: "draft",
    generatedAt: generatedAt.toISOString(),
    autoStartsAt: addMinutes(generatedAt, AUTO_START_MINUTES).toISOString(),
    activatedAt: null,
    approvedBy: null,
    changeNote,
  });
  return strategy;
}

/** "Start now": the owner starts the draft, which sets `approvedBy`. Starting never publishes. */
export function startNow(strategy: Strategy, viewerId: string): Strategy {
  if (strategy.status !== "draft") throw new Error("This strategy is already running.");
  return Object.assign(strategy, { status: "active", activatedAt: new Date().toISOString(), approvedBy: viewerId });
}

/** Shift the mix toward the leading pillar, as the agent would after a good month. */
export function shiftMixTowardLeader(strategy: Strategy) {
  const [lead, ...rest] = strategy.pillars;
  const last = rest[rest.length - 1];
  if (!lead || !last || lead.share > 55) return;
  const shift = Math.min(5, last.share - 5);
  if (shift <= 0) return;
  lead.share += shift;
  last.share -= shift;
}
