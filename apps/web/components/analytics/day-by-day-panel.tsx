import { format, isSameDay, parseISO } from "date-fns";
import type { AnalyticsReport } from "@/lib/types";
import { formatNumber } from "@repo/ui/lib/utils";
import { Panel } from "@repo/ui/components/states";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { DayByDayChart } from "./day-by-day-chart";

/** Results per day, with the best day and the post that went out on it. */
export function DayByDayPanel({ report }: { report: AnalyticsReport }) {
  if (report.days.length === 0) return null;

  const bestDay = report.days.reduce((best, d) => (d.reach > best.reach ? d : best), report.days[0]!);
  const bestDayDate = parseISO(bestDay.date);
  const bestDayPost = report.bestPosts.find((p) => p.publishedAt && isSameDay(parseISO(p.publishedAt), bestDayDate));

  return (
    <Panel aria-labelledby="days-heading">
      <DayByDayChart days={report.days} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border pt-4 text-sm">
        <p className="min-w-0">
          <span className="font-medium">
            Best day: {format(bestDayDate, "EEE d MMM")}, {formatNumber(bestDay.reach)} people.
          </span>{" "}
          {bestDayPost && <span className="text-muted-foreground">&ldquo;{bestDayPost.hook}&rdquo; went out that day.</span>}
        </p>
        {report.platforms.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] text-muted-foreground">
            {report.platforms.map((platform) => (
              <span key={platform} className="inline-flex items-center gap-1.5">
                <PlatformIcon platform={platform} className="size-3.5" />
                {PLATFORM_LABEL[platform]} posts
              </span>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}
