import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import type { ObsOverview, ObsRange } from "@/lib/types";
import { StatTile } from "./stat-tile";
import { Sparkline } from "./sparkline";
import { TrendDelta } from "./trend-delta";
import { formatUsd, compareLabel } from "./format";

/** The four headline numbers: error rate, people affected, AI cost, agent runs. */
export function OverviewStats({ overview, range }: { overview: ObsOverview; range: ObsRange }) {
  const errorRateHourly = overview.requests.map((r) => (r.count > 0 ? Math.round((r.errors / r.count) * 1000) / 10 : 0));
  const costSeries = overview.aiCostByDay.map((d) => d.cost);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="API error rate" value={`${overview.apiErrorRate.value}%`} spark={<Sparkline values={errorRateHourly} tone="destructive" />}>
        <TrendDelta delta={overview.apiErrorRate.value - overview.apiErrorRate.previous} label={compareLabel(range)} format={(n) => `${n.toFixed(1)} pts`} />
      </StatTile>
      <StatTile
        label="People who hit an error"
        value={<>{overview.peopleWithError.count}<small className="ml-1 text-base font-normal text-muted-foreground">of {overview.peopleWithError.of}</small></>}
        spark={<Sparkline values={overview.peopleWithError.hourly} tone="destructive" />}
      >
        {overview.peopleWithError.newErrors > 0 && <Badge variant="danger">{overview.peopleWithError.newErrors} new error</Badge>}
        <Link href="/admin/observability/frontend" className="flex items-center gap-0.5 font-medium text-tint-foreground hover:underline">
          Frontend
          <ChevronRight className="size-3.5" />
        </Link>
      </StatTile>
      <StatTile label="AI cost" value={formatUsd(overview.aiCost.value)} spark={<Sparkline values={costSeries} />}>
        <TrendDelta delta={overview.aiCost.value - overview.aiCost.previous} label={compareLabel(range)} format={formatUsd} goodWhen="down" />
      </StatTile>
      <StatTile label="Agent runs" value={overview.agentRuns.total} spark={<Sparkline values={overview.agentRuns.hourly} />}>
        {overview.agentRuns.failed > 0 && <Badge variant="danger">{overview.agentRuns.failed} failed</Badge>}
        <span>{overview.agentRuns.total - overview.agentRuns.failed} finished</span>
      </StatTile>
    </div>
  );
}
