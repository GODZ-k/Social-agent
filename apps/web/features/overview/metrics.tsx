import type { Client } from "@/lib/types";
import { formatCompact } from "@/lib/utils";
import { Metric } from "./metric";

export function Metrics({ stats }: { stats: Client["stats"] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      <Metric label="Followers" value={formatCompact(stats.followers)} delta={stats.followersDelta} />
      <Metric label="Engagement rate" value={`${stats.engagementRate}%`} delta={stats.engagementDelta} />
      <Metric label="Scheduled" value={String(stats.scheduled)} hint="posts queued" />
      <Metric label="Needs approval" value={String(stats.pendingApprovals)} hint="waiting on you" />
    </dl>
  );
}
