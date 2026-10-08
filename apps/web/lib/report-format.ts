import type { AnalyticsReport } from "./types";

/** "1 post", "3 posts". */
export function postsLabel(count: number): string {
  return `${count} ${count === 1 ? "post" : "posts"}`;
}

/** How many of every 100 in `whole` did `part`; 0 when there is nothing to divide by. */
export function per100(part: number, whole: number): number {
  return whole ? Math.round((part / whole) * 100) : 0;
}

export function reachTotal(report: AnalyticsReport): number {
  return report.totals.find((t) => t.key === "reach")?.value ?? 0;
}
