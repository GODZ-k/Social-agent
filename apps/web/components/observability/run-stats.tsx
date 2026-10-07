import type { AgentRunDetail } from "@/lib/types";
import { StatTile } from "./stat-tile";
import { formatMs, formatTokens, formatUsd } from "./format";

/** Duration, steps, tokens and cost for one run. */
export function RunStats({ run }: { run: AgentRunDetail }) {
  const failedStep = run.steps.find((s) => s.status === "failed");
  const longest = run.steps.reduce((a, b) => (b.durationMs > a.durationMs ? b : a), run.steps[0]!);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="Duration" value={formatMs(run.durationMs)}>
        Longest step: {longest.name}
      </StatTile>
      <StatTile label="Steps" value={`${run.steps.length - (failedStep ? 1 : 0)} of ${run.steps.length}`}>
        {failedStep ? (
          <span className="text-destructive">{failedStep.name} failed</span>
        ) : (
          <span>All steps finished</span>
        )}
      </StatTile>
      <StatTile label="Tokens" value={formatTokens(run.tokens.input + run.tokens.output)}>
        {formatTokens(run.tokens.input)} input, {formatTokens(run.tokens.output)} output
      </StatTile>
      <StatTile label="Cost" value={formatUsd(run.costByAgent.reduce((sum, c) => sum + c.cost, 0))}>
        Across {run.modelCalls} model calls
      </StatTile>
    </div>
  );
}
