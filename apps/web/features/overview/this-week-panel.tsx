import { eachDayOfInterval, format, parseISO } from "date-fns";
import type { BrandKit } from "@social-agent/shared";
import type { CalendarDay } from "@/lib/types";
import { getCalendarMonth, getThisWeek } from "@/lib/api/server";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { ThisWeekFrame } from "./this-week-frame";
import { WeekLegend } from "./week-legend";
import { WeekDay } from "./week-day";

/** Reads its own week so the rest of the overview does not wait for it; rendered under Suspense. */
export async function ThisWeekPanel({
  clientId,
  brand,
  basePath = "/c",
}: {
  clientId: string;
  brand: BrandKit;
  basePath?: WorkspaceBasePath;
}) {
  const thisWeek = await getThisWeek(clientId);
  if (!thisWeek) return null;

  const from = parseISO(thisWeek.from);
  const to = parseISO(thisWeek.to);
  // The week can straddle two months; the calendar read is what carries each day's free best times.
  const months = [...new Set([format(from, "yyyy-MM"), format(to, "yyyy-MM")])];
  const monthsData = await Promise.all(months.map((month) => getCalendarMonth(clientId, month)));
  const dayByDate = new Map(monthsData.flatMap((month) => month?.days ?? []).map((day) => [day.date, day]));
  const days = eachDayOfInterval({ start: from, end: to }).map(
    (date): CalendarDay => dayByDate.get(format(date, "yyyy-MM-dd")) ?? { date: format(date, "yyyy-MM-dd"), posts: [], freeBestTimes: [] },
  );

  return (
    <ThisWeekFrame clientId={clientId} subtitle={`${format(from, "d MMMM")} to ${format(to, "d MMMM")}`} basePath={basePath}>
      <WeekLegend days={days} />
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-7">
        {days.map((day) => (
          <WeekDay key={day.date} day={day} brand={brand} clientId={clientId} basePath={basePath} />
        ))}
      </div>
    </ThisWeekFrame>
  );
}
