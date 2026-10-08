import { Fragment } from "react";
import type { Strategy } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Panel } from "@repo/ui/components/states";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** "Tue 8:00am" -> { day: "Tue", label: "8 AM" }; drops :00 for a cleaner grid. */
function parseSlot(slot: string) {
  const match = /^(\w{3})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(slot.trim());
  if (!match) return null;
  const [, day, hour, minute, meridiem] = match;
  const label = minute === "00" ? `${hour} ${meridiem!.toUpperCase()}` : `${hour}:${minute} ${meridiem!.toUpperCase()}`;
  return { day: day!, label };
}

/** S20 "When it goes out": a week grid of best times, one row per platform. */
export function PostingTimesPanel({ cadence }: { cadence: Strategy["cadence"] }) {
  const postsPerWeek = cadence.reduce((sum, entry) => sum + entry.perWeek, 0);

  return (
    <Panel aria-labelledby="posting-times-heading">
      <h2 id="posting-times-heading" className="type-heading">
        When it goes out
      </h2>
      <p className="type-label mt-1 mb-5">
        {postsPerWeek} {postsPerWeek === 1 ? "post" : "posts"} a week, at the times your customers are most active.
      </p>
      <div className="grid grid-cols-[2rem_repeat(7,minmax(0,1fr))] items-center gap-1 min-[561px]:grid-cols-[5.5rem_repeat(7,minmax(0,1fr))] min-[561px]:gap-1.5">
        <span />
        {DAYS.map((day) => (
          <span key={day} className="type-label text-center text-[0.6875rem]">
            {day}
          </span>
        ))}
        {cadence.map((entry, i) => {
          const byDay = new Map(
            entry.bestTimes.flatMap((slot) => {
              const parsed = parseSlot(slot);
              return parsed ? [[parsed.day, parsed.label] as const] : [];
            }),
          );
          // The main platform (most posts) reads solid; the rest read as a pale tint.
          const tone = i === 0 ? "bg-primary text-primary-foreground" : "bg-tint text-tint-foreground";
          return (
            <Fragment key={entry.platform}>
              <span className="flex min-w-0 items-center gap-1.5 text-[0.8125rem] font-medium">
                <PlatformIcon platform={entry.platform} className="size-4 shrink-0" />
                <span className="hidden truncate min-[561px]:inline">{PLATFORM_LABEL[entry.platform]}</span>
              </span>
              {DAYS.map((day) => {
                const label = byDay.get(day);
                return (
                  <span
                    key={day}
                    className={cn(
                      "flex h-9 items-center justify-center whitespace-nowrap rounded-md text-[0.5625rem] font-semibold min-[561px]:h-10 min-[561px]:text-[0.6875rem]",
                      label ? tone : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {label ?? "–"}
                  </span>
                );
              })}
            </Fragment>
          );
        })}
      </div>
      <p className="type-label mt-4">
        Times come from when similar brands get the most saves. They adjust once your own results come in.
      </p>
    </Panel>
  );
}
