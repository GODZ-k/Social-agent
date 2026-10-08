import { format, parseISO } from "date-fns";
import { getAnalyticsReport, listReviewQueue } from "@/lib/api/server";
import type { AnalyticsRange, AnalyticsReport, Brand } from "@/lib/types";
import { PLATFORM_LABEL } from "@repo/ui/components/social/platform";
import { AnalyticsEmpty } from "./analytics-empty";
import { RangeToggle } from "./range-toggle";
import { SummaryBanner } from "./summary-banner";
import { KpiRow } from "./kpi-row";
import { DayByDayPanel } from "./day-by-day-panel";
import { PostsPanel } from "./posts-panel";
import { ComparisonSection } from "./comparison-section";
import { LearnedSection } from "./learned-section";
import { postsLabel } from "@/lib/report-format";
import { formatList } from "@/lib/utils";
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

/** Reads the analytics report and shows the empty state, the first week, or a full month's verdict. */
export async function AnalyticsBody({
  brandId,
  brand,
  basePath = routes.brand.base,
  range,
}: {
  brandId: string;
  brand: Brand;
  basePath?: WorkspaceBase;
  range: AnalyticsRange;
}) {
  const report = await getAnalyticsReport(brandId, range);
  if (!report || report.phase === "empty") {
    const reviewPosts = await listReviewQueue(brandId);
    return <AnalyticsEmpty brand={brand} reviewPosts={reviewPosts} basePath={basePath} />;
  }

  const period = periodLabel(report);

  return (
    <div className="grid gap-5">
      <div className="-mt-1 flex flex-wrap items-center justify-between gap-3">
        <p className="type-label">{period}</p>
        <RangeToggle range={report.range} />
      </div>
      {report.phase === "month" && <SummaryBanner report={report} />}
      <KpiRow report={report} />
      <DayByDayPanel report={report} />
      <PostsPanel report={report} brand={brand.brand} />
      <ComparisonSection report={report} />
      <LearnedSection report={report} brandId={brandId} basePath={basePath} />
    </div>
  );
}

function periodLabel(report: AnalyticsReport): string {
  const from = format(parseISO(report.from), "d MMMM");
  const to = format(parseISO(report.to), "d MMMM");
  const posts = postsLabel(report.postCount);
  if (report.phase === "first_week") {
    return `${from} to ${to}, ${posts} so far.`;
  }
  const platforms = report.platforms.map((p) => PLATFORM_LABEL[p]);
  const where = platforms.length ? ` on ${formatList(platforms)}` : "";
  return `${from} to ${to}, ${posts}${where}. Compared with small shops like yours, from your research.`;
}
