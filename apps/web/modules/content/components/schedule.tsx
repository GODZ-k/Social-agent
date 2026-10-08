import { format, parseISO } from "date-fns";
import { relativeDayLabel } from "@/lib/format-post";

/** Table cell: "EEE d MMM, h:mm a" plus a relative day label, or "Not set" when nothing's scheduled. */
export function ScheduleCell({ when }: { when: string | null }) {
  if (!when) return <span className="text-muted-foreground">Not set</span>;
  const date = parseISO(when);
  return (
    <>
      <span className="block tabular-nums">{format(date, "EEE d MMM, h:mm a")}</span>
      <span className="type-label">{relativeDayLabel(date)}</span>
    </>
  );
}

/** Card row: same date and relative label as `ScheduleCell`, shown only when there's a time to show. */
export function ScheduleLine({ when }: { when: string | null }) {
  if (!when) return null;
  const date = parseISO(when);
  return (
    <span className="flex items-baseline gap-1.5 text-sm">
      <span className="tabular-nums">{format(date, "EEE d MMM, h:mm a")}</span>
      <span className="type-label">{relativeDayLabel(date)}</span>
    </span>
  );
}
