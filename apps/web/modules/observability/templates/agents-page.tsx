import { notFound } from "next/navigation";
import { getObsAgents, getObsOverview } from "@/lib/api/server";
import type { RouteSearchParams } from "@/lib/types";
import { ObsPageHeader } from "@/modules/observability/components/obs-page-header";
import { ObsTabs } from "@/modules/observability/components/obs-tabs";
import { parseObsSearchParams } from "@/modules/observability/schemas/search-params";
import { AgentsStats } from "@/modules/observability/components/agents-stats";
import { ModelsPanel } from "@/modules/observability/components/list-panels";
import { UsageByAgentPanel } from "@/modules/observability/components/usage-by-agent-panel";
import { RunsByKindPanel } from "@/modules/observability/components/runs-by-kind-panel";
import { LatencyByKindPanel } from "@/modules/observability/components/latency-by-kind-panel";
import { UsageOverTimePanel } from "@/modules/observability/components/usage-over-time-panel";
import { CostByClientPanel } from "@/modules/observability/components/cost-by-client-panel";
import { RecentRunsPanel } from "@/modules/observability/components/recent-runs-panel";

export async function ObsAgentsPage({ searchParams }: { searchParams: RouteSearchParams }) {
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
