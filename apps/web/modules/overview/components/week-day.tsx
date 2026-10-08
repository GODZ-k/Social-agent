import { format, isToday, parseISO } from "date-fns";
import type { BrandKit } from "@social-agent/shared";
import type { CalendarDay } from "@/lib/types";
import { cn } from "@/lib/utils";
import { WeekPostChip } from "./week-post-chip";
import { routes, workspaceRoutes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

/**
 * One day of the week: a rounded tile, a column on desktop and a row below
 * 1024px. Same markup both ways; the responsive classes alone change the layout.
 */
export function WeekDay({
  day,
  brand,
  brandId,
  basePath = routes.brand.base,
}: {
  day: CalendarDay;
  brand: BrandKit;
  brandId: string;
  basePath?: WorkspaceBase;
}) {
  const date = parseISO(day.date);
  const today = isToday(date);

  return (
    <div className={cn("flex items-start gap-3 rounded-2xl p-3 md:flex-col md:gap-2", today ? "bg-tint" : "bg-secondary/60")}>
      <div className="flex w-14 shrink-0 flex-col md:w-full md:flex-row md:items-baseline md:justify-between">
        <span className={cn("type-label", today && "text-tint-foreground")}>{today ? "Today" : format(date, "EEE")}</span>
        <span className={cn("type-number text-lg", today && "text-tint-foreground")}>{format(date, "d")}</span>
      </div>
      <div className="grid min-w-0 flex-1 gap-2 w-full">
        {day.posts.length > 0 ? (
          day.posts.map((post) => <WeekPostChip key={post.id} post={post} brand={brand} href={workspaceRoutes(basePath).postSheet(brandId, post.id)} />)
        ) : day.freeBestTimes.length > 0 ? (
          day.freeBestTimes.map((slot) => (
            <p
              key={`${slot.platform}-${slot.time}`}
              className="rounded-xl border border-dashed border-border px-3 py-2 text-[0.8125rem] text-muted-foreground"
            >
              <b className="font-medium text-foreground tabular-nums">{slot.label}</b> free best time
            </p>
          ))
        ) : (
          <p className="text-[0.8125rem] text-muted-foreground">Nothing planned</p>
        )}
      </div>
    </div>
  );
}
