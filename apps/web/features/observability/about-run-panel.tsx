"use client";

// Client side because the chart takes a formatter function, which cannot cross the server boundary.
import type { AgentRunDetail } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { RankedBars } from "@repo/ui/components/social/charts";
import { CopyField } from "./copy-field";
import { formatUsd } from "./format";

/** IDs to share when reporting this run, and what each agent in it cost. */
export function AboutRunPanel({ run }: { run: AgentRunDetail }) {
  return (
    <Panel>
      <h2 className="type-heading">About this run</h2>
      <p className="type-label mt-1 mb-4">IDs to share when reporting it.</p>
      <table className="w-full text-sm">
        <tbody>
          <tr className="border-b">
            <td className="py-2 pr-3 text-muted-foreground">Run ID</td>
            <td className="py-2 text-right"><CopyField value={run.id} /></td>
          </tr>
          <tr className="border-b">
            <td className="py-2 pr-3 text-muted-foreground">Trace ID</td>
            <td className="py-2 text-right"><CopyField value={run.traceId} /></td>
          </tr>
          <tr className="border-b">
            <td className="py-2 pr-3 text-muted-foreground">Client</td>
            <td className="py-2 text-right font-medium">{run.brandName}</td>
          </tr>
          <tr>
            <td className="py-2 pr-3 text-muted-foreground">Workflow</td>
            <td className="py-2 text-right font-medium">{run.workflow}</td>
          </tr>
        </tbody>
      </table>
      {run.costByAgent.length > 0 && (
        <>
          <h3 className="type-heading mt-5 mb-3 text-base">Cost by agent</h3>
          <RankedBars rows={run.costByAgent.map((c) => ({ label: c.agent, value: c.cost }))} metric="Cost" formatValue={formatUsd} />
        </>
      )}
    </Panel>
  );
}
