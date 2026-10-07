import { notFound } from "next/navigation";
import { getObsAgents, getObsOverview } from "@/lib/api/server";
import { ObsPageHeader } from "@/components/observability/obs-page-header";
import { ObsTabs } from "@/components/observability/obs-tabs";
import { parseObsSearchParams } from "@/components/observability/search-params";
import { AgentsStats } from "@/components/observability/agents-stats";
import { ModelsPanel } from "@/components/observability/list-panels";
import { UsageByAgentPanel } from "@/components/observability/usage-by-agent-panel";
import { RunsByKindPanel } from "@/components/observability/runs-by-kind-panel";
import { LatencyByKindPanel } from "@/components/observability/latency-by-kind-panel";
import { UsageOverTimePanel } from "@/components/observability/usage-over-time-panel";
import { CostByClientPanel } from "@/components/observability/cost-by-client-panel";
import { RecentRunsPanel } from "@/components/observability/recent-runs-panel";

export default async function ObservabilityAgentsPage({ searchParams }: { searchParams: Promise<{ range?: string; brand?: string }> }) {
  const { range, brandId } = parseObsSearchParams(await searchParams);
  const [agents, overview] = await Promise.all([getObsAgents(range, { brandId }), getObsOverview(range, { brandId })]);
  if (!agents || !overview) notFound();

  return (
    <>
      <ObsPageHeader />
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
