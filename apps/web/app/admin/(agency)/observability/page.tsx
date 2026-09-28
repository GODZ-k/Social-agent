import { notFound } from "next/navigation";
import { getObsOverview } from "@/lib/api/server";
import { PageHeader } from "@repo/ui/components/states";
import { formatNumber } from "@/lib/utils";
import { ObsTabs } from "@/features/observability/obs-tabs";
import { parseObsSearchParams } from "@/features/observability/search-params";
import { HeadlineBanner } from "@/features/observability/headline-banner";
import { OverviewStats } from "@/features/observability/overview-stats";
import { HourlyPanel } from "@/features/observability/hourly-panel";
import { AiCostPanel } from "@/features/observability/ai-cost-panel";
import { CostByClientPanel } from "@/features/observability/cost-by-client-panel";
import { AttentionPanel } from "@/features/observability/attention-panel";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ObservabilityOverviewPage({ searchParams }: { searchParams: Promise<{ range?: string; brand?: string }> }) {
  const { range, brandId } = parseObsSearchParams(await searchParams);
  const overview = await getObsOverview(range, { brandId });
  if (!overview) notFound();

  const totalRequests = overview.requests.reduce((sum, r) => sum + r.count, 0);
  const totalErrors = overview.requests.reduce((sum, r) => sum + r.errors, 0);

  return (
    <>
      <PageHeader title="Observability" description="How the app, the server and the AI agents are doing, across every client." />
      <ObsTabs active="overview" checkedAt={overview.checkedAt} range={range} brandId={brandId} />
      <HeadlineBanner
        title={overview.headline.title}
        detail={overview.headline.detail}
        tone={overview.attention.length === 0 ? "ok" : "warning"}
        checkedAt={overview.checkedAt}
        href="#attention"
        linkLabel="See what needs attention"
      />
      <OverviewStats overview={overview} range={range} />
      <div className="mt-5 grid gap-5 lg:grid-cols-[2fr_1fr]">
        <HourlyPanel
          title="API requests"
          description="Calls to the API per hour, and how many failed."
          total={formatNumber(totalRequests)}
          caption="Total requests"
          rows={overview.requests.map((r) => ({ at: r.at, primary: r.count, secondary: r.errors }))}
          primaryLabel={`Requests ${formatNumber(totalRequests)}`}
          secondaryLabel={`Errors ${formatNumber(totalErrors)}`}
          secondaryColor="var(--destructive)"
        />
        <AiCostPanel byDay={overview.aiCostByDay} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <CostByClientPanel title="Top clients by AI cost" description="Who the agents worked for today." rows={overview.topClientsByCost} clientsHref="/admin/clients" />
        <div id="attention">
          <AttentionPanel items={overview.attention} clearedOnTheirOwn={overview.clearedOnTheirOwn} range={range} />
        </div>
      </div>
    </>
  );
}
