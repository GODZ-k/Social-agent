import type { AnalyticsReport, AnalyticsTotal } from "@/lib/types";
import { formatNumber } from "@repo/ui/lib/utils";
import { per100, postsLabel, reachTotal } from "./report-format";

/** A plain-language reason for a KPI's verdict, built only from numbers the report already carries. */
export function kpiWhy(total: AnalyticsTotal, report: AnalyticsReport): string {
  if (total.verdict === "too_early") {
    return `${postsLabel(report.postCount)} so far. A fair comparison needs more posts.`;
  }

  const reach = reachTotal(report);

  switch (total.key) {
    case "reach": {
      const perPost = report.postCount ? Math.round(total.value / report.postCount) : total.value;
      const benchmarkPerPost = total.benchmark && report.postCount ? Math.round(total.benchmark / report.postCount) : null;
      return benchmarkPerPost
        ? `About ${formatNumber(perPost)} people per post. Small shops like yours usually reach about ${formatNumber(benchmarkPerPost)}.`
        : `About ${formatNumber(perPost)} people per post.`;
    }
    case "saves": {
      const rate = per100(total.value, reach);
      const benchmarkRate = total.benchmark && reach ? per100(total.benchmark, reach) : null;
      return benchmarkRate
        ? `${rate} of every 100 people who saw a post saved it. Small shops like yours usually see about ${benchmarkRate}.`
        : `${rate} of every 100 people who saw a post saved it.`;
    }
    case "interactions": {
      const rate = per100(total.value, reach);
      const benchmarkRate = total.benchmark && reach ? per100(total.benchmark, reach) : null;
      return benchmarkRate
        ? `${rate} of every 100 people liked, commented or shared. Similar shops get about ${benchmarkRate}.`
        : `${rate} of every 100 people liked, commented or shared.`;
    }
    case "followers":
      return `From ${formatNumber(report.followers.from)} to ${formatNumber(report.followers.to)}.`;
  }
}
