import { ChartNoAxesCombined } from "lucide-react";
import type { AnalyticsReport } from "@/lib/types";
import { formatNumber } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/button";
import { reachTotal } from "./report-format";

/** The month in one line: the agent's own top finding, in numbers pulled straight from the report. */
export function SummaryBanner({ report }: { report: AnalyticsReport }) {
  const reach = reachTotal(report);
  const followersGained = report.followers.to - report.followers.from;
  const headline = report.learnings[0]?.insight ?? `${formatNumber(reach)} people saw your posts this period`;

  return (
    <section className="flex flex-wrap items-center gap-5 rounded-[1.375rem] bg-tint p-5 md:p-6">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-card text-tint-foreground">
        <ChartNoAxesCombined className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="type-heading max-w-[46ch] text-tint-foreground">{headline}.</h2>
        <p className="mt-1.5 max-w-[70ch] text-tint-foreground/80">
          {formatNumber(reach)} people saw your posts and {formatNumber(followersGained)} started following you.
          {report.learnings.length > 0 &&
            ` The agent found ${report.learnings.length} thing${report.learnings.length === 1 ? "" : "s"} to change and has updated next month's plan.`}
        </p>
      </div>
      {report.learnings.length > 0 && (
        <Button asChild>
          <a href="#learned">See what changed</a>
        </Button>
      )}
    </section>
  );
}
