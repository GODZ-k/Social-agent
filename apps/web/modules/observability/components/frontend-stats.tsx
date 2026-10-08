import type { ObsFrontend, ObsRange } from "@/lib/types";
import { StatTile } from "./stat-tile";
import { Sparkline } from "./sparkline";
import { TrendDelta } from "./trend-delta";
import { compareLabel } from "@/modules/observability/utils/format";
import { formatNumber } from "@/lib/utils";

/** People who hit an error, error-free sessions, and how many API calls and actions failed. */
export function FrontendStats({ frontend, range }: { frontend: ObsFrontend; range: ObsRange }) {
  const errorTrend = frontend.sessionsWithError.map((s) => s.count);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="People who hit an error" value={frontend.peopleWithError.count} spark={<Sparkline values={errorTrend} tone="destructive" />}>
        <TrendDelta
          delta={frontend.peopleWithError.count - frontend.peopleWithError.previous}
          label={`of ${frontend.peopleWithError.of} people who used the app`}
          format={(n) => `${n}`}
          goodWhen="down"
        />
      </StatTile>
      <StatTile label="Error-free sessions" value={`${frontend.errorFreeSessions.value}%`} spark={<Sparkline values={errorTrend} tone="destructive" />}>
        <TrendDelta
          delta={frontend.errorFreeSessions.value - frontend.errorFreeSessions.previous}
          label={compareLabel(range)}
          format={(n) => `${n.toFixed(1)} pts`}
          goodWhen="up"
        />
      </StatTile>
      <StatTile label="Failed API calls" value={frontend.failedApiCalls.count}>
        From {formatNumber(frontend.failedApiCalls.of)} calls the app made
      </StatTile>
      <StatTile label="Failed actions" value={frontend.failedActions.count}>
        Out of {frontend.failedActions.of} things people tried
      </StatTile>
    </div>
  );
}
