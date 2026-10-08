import { Bookmark, Eye, Heart, UserPlus, type LucideIcon } from "lucide-react";
import type { AnalyticsReport, AnalyticsTotal } from "@/lib/types";
import { formatNumber } from "@repo/ui/lib/utils";
import { KpiCard } from "./kpi-card";
import { kpiWhy } from "@/modules/analytics/utils/kpi-copy";

const KPI_META: Record<AnalyticsTotal["key"], { label: string; icon: LucideIcon }> = {
  reach: { label: "People reached", icon: Eye },
  saves: { label: "Saves", icon: Bookmark },
  interactions: { label: "Likes and comments", icon: Heart },
  followers: { label: "New followers", icon: UserPlus },
};

/** The four headline numbers, each already judged against small shops like this one. */
export function KpiRow({ report }: { report: AnalyticsReport }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {report.totals.map((total) => {
        const meta = KPI_META[total.key];
        const Icon = meta.icon;
        const value = total.key === "followers" ? `+${formatNumber(total.value)}` : formatNumber(total.value);
        const why = kpiWhy(total, report);
        return (
          <KpiCard
            key={total.key}
            label={meta.label}
            icon={<Icon className="size-4 text-muted-foreground" />}
            verdict={total.verdict}
            value={value}
            why={why}
          />
        );
      })}
    </div>
  );
}
