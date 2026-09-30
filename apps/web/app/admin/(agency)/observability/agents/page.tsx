import { notFound } from "next/navigation";
import { getObsAgents, getObsOverview } from "@/lib/api/server";
import { PageHeader } from "@repo/ui/components/states";
import { ObsTabs } from "@/features/observability/obs-tabs";
import { parseObsSearchParams } from "@/features/observability/search-params";
import { AgentsStats } from "@/features/observability/agents-stats";
import { ModelsPanel } from "@/features/observability/models-panel";
import { UsageByAgentPanel } from "@/features/observability/usage-by-agent-panel";
import { RunsByKindPanel } from "@/features/observability/runs-by-kind-panel";
import { LatencyByKindPanel } from "@/features/observability/latency-by-kind-panel";
import { UsageOverTimePanel } from "@/features/observability/usage-over-time-panel";
import { CostByClientPanel } from "@/features/observability/cost-by-client-panel";
import { RecentRunsPanel } from "@/features/observability/recent-runs-panel";

export default async function ObservabilityAgentsPage({ searchParams }: { searchParams: Promise<{ range?: string; brand?: string }> }) {
  const { range, brandId } = parseObsSearchParams(await searchParams);
  const [agents, overview] = await Promise.all([getObsAgents(range, { brandId }), getObsOverview(range, { brandId })]);
  if (!agents || !overview) notFound();

  return (
    <>
      <PageHeader title="Observability" description="How the app, the server and the AI agents are doing, across every client." />
      <ObsTabs active="agents" checkedAt={overview.checkedAt} range={range} brandId={brandId} />
      <AgentsStats agents={agents} range={range} />
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="min-w-0"><ModelsPanel models={agents.models} /></div>
        <div className="min-w-0"><UsageByAgentPanel byAgent={agents.byAgent} /></div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="min-w-0"><RunsByKindPanel rows={agents.runsByName} /></div>
        <div className="min-w-0"><LatencyByKindPanel latencyByKind={agents.latencyByKind} /></div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="min-w-0"><UsageOverTimePanel tokensHourly={agents.tokensHourly} costHourly={agents.costHourly} /></div>
        <div className="min-w-0"><CostByClientPanel title="Cost by client" description="Who the AI spend was for." rows={agents.costByClient} /></div>
      </div>
      <div className="mt-5 min-w-0">
        <RecentRunsPanel runs={agents.recentRuns} />
      </div>
    </>
  );
}
