import type { CalendarDay } from "@/lib/types";

/** Counts scheduled, needs-approval and still-free best times across the week's days. */
export function WeekLegend({ days }: { days: CalendarDay[] }) {
  const scheduled = days.reduce((n, day) => n + day.posts.filter((p) => p.state === "scheduled").length, 0);
  const needsApproval = days.reduce((n, day) => n + day.posts.filter((p) => p.state === "needs_approval").length, 0);
  const free = days.reduce((n, day) => n + day.freeBestTimes.length, 0);

  return (
    <ul className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8125rem] text-muted-foreground">
      <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-tint-foreground" aria-hidden />{scheduled} scheduled</li>
      <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" aria-hidden />{needsApproval} need approval</li>
      <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-secondary ring-1 ring-border" aria-hidden />{free} free best times</li>
      <li className="w-full text-muted-foreground/70 lg:w-auto lg:ml-auto">Tap a post to see it</li>
    </ul>
  );
}
