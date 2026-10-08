import type { ObsRange, ObsServer } from "@/lib/types";
import { StatTile } from "./stat-tile";
import { Sparkline } from "./sparkline";
import { TrendDelta } from "./trend-delta";
import { formatMs, compareLabel } from "@/modules/observability/utils/format";
import { formatCompact } from "@/lib/utils";

/** "380 ms" with the unit a size smaller, so the number reads first. */
function MsValue({ ms }: { ms: number }) {
  const [number, ...unit] = formatMs(ms).split(" ");
  return (
    <>
      {number}
      <small className="ml-1 text-base font-normal text-muted-foreground">{unit.join(" ")}</small>
    </>
  );
}

/** Requests, server errors, p95 latency and uptime over the window. */
export function ServerStats({ server, range }: { server: ObsServer; range: ObsRange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="Requests" value={formatCompact(server.requests.value)} spark={<Sparkline values={server.hourly.map((h) => h.count)} />}>
        <TrendDelta
          delta={((server.requests.value - server.requests.previous) / server.requests.previous) * 100}
          label={compareLabel(range)}
          format={(n) => `${n.toFixed(1)}%`}
          goodWhen="up"
        />
      </StatTile>
      <StatTile label="Server errors" value={`${server.serverErrors.rate}%`} spark={<Sparkline values={server.hourly.map((h) => h.errors)} tone="destructive" />}>
        {server.serverErrors.count} requests ended in a 5xx
      </StatTile>
      <StatTile label="p95 latency" value={<MsValue ms={server.p95Ms.value} />} spark={<Sparkline values={server.hourly.map((h) => h.p95)} />}>
        <TrendDelta delta={server.p95Ms.value - server.p95Ms.previous} label={compareLabel(range)} format={(n) => formatMs(Math.round(n))} goodWhen="down" />
      </StatTile>
      <StatTile label="Uptime" value={`${server.uptime30d}%`}>
        Last 30 days
      </StatTile>
    </div>
  );
}
