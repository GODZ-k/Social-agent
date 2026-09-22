import { format, isSameMonth, isToday } from "date-fns";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PlatformIcon, STATUS_LABEL } from "@repo/ui/components/social/platform";
import { CHIP, dayKey, postDate } from "./calendar-model";

/** Wide screens: the month as a grid. */
export function MonthGrid({
  days,
  byDay,
  month,
  onOpen,
}: {
  days: Date[];
  byDay: Map<string, Post[]>;
  month: Date;
  onOpen: (postId: string) => void;
}) {
  return (
    <div className="hidden overflow-hidden rounded-xl bg-card shadow-raised md:block">
      <div className="grid grid-cols-7 border-b">
        {days.slice(0, 7).map((d) => (
          <div key={d.toISOString()} className="type-label px-3 py-2.5">{format(d, "EEE")}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const items = byDay.get(dayKey(day)) ?? [];
          const inMonth = isSameMonth(day, month);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-28 min-w-0 border-b p-1.5 lg:min-h-32",
                i % 7 !== 6 && "border-r",
                i >= days.length - 7 && "border-b-0",
                !inMonth && "bg-background/60",
              )}
            >
              <p className={cn("mb-1 ml-auto grid size-6 place-items-center rounded-full text-xs tabular-nums", dayNumberTone(day, inMonth))}>
                {format(day, "d")}
              </p>
              {/* minmax(0,1fr): without it the column grows to fit the longest headline. */}
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-1">
                {items.map((post) => (
                  <li key={post.id} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onOpen(post.id)}
                      title={`${post.hook} (${STATUS_LABEL[post.status]})`}
                      className={cn("pressable flex w-full items-center gap-1.5 rounded-sm px-1.5 py-1 text-left text-xs", CHIP[post.status])}
                    >
                      <PlatformIcon platform={post.platform} className="size-3" />
                      <span className="shrink-0 tabular-nums opacity-80">{format(new Date(postDate(post)!), "h:mma").toLowerCase()}</span>
                      <span className="truncate font-medium">{post.hook}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Today is marked; days spilling in from the neighbouring months stay quiet. */
function dayNumberTone(day: Date, inMonth: boolean): string {
  if (isToday(day)) return "bg-primary font-semibold text-primary-foreground";
  return inMonth ? "text-foreground" : "text-muted-foreground/60";
}
