import type { ObsAgents, ObsRange } from "@/lib/types";
import { StatTile } from "./stat-tile";
import { Sparkline } from "./sparkline";
import { TrendDelta } from "./trend-delta";
import { formatTokens, formatUsd, compareLabel } from "@/modules/observability/utils/format";

/** Agent runs, model cost and tokens over the window. */
export function AgentsStats({ agents, range }: { agents: ObsAgents; range: ObsRange }) {
  const tokensHourly = agents.tokensHourly.map((h) => h.input + h.output);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatTile label="Agent runs" value={agents.runs.value} spark={<Sparkline values={agents.runs.hourly} />}>
        <TrendDelta delta={agents.runs.value - agents.runs.previous} label={compareLabel(range)} format={(n) => `${n}`} goodWhen="up" />
      </StatTile>
      <StatTile label="Model cost" value={formatUsd(agents.cost.value)} spark={<Sparkline values={agents.cost.hourly} />}>
        <TrendDelta delta={agents.cost.value - agents.cost.previous} label={compareLabel(range)} format={formatUsd} goodWhen="down" />
      </StatTile>
      <StatTile label="Tokens" value={formatTokens(agents.tokens.input + agents.tokens.output)} spark={<Sparkline values={tokensHourly} />}>
        <span>
          {formatTokens(agents.tokens.input)} input, {formatTokens(agents.tokens.output)} output
        </span>
      </StatTile>
    </div>
  );
}
