import { notFound } from "next/navigation";
import { routes } from "@/config/routes";
import { getObsOverview } from "@/lib/api/server";
import type { RouteSearchParams } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { ObsPageHeader } from "@/modules/observability/components/obs-page-header";
import { ObsTabs } from "@/modules/observability/components/obs-tabs";
import { parseObsSearchParams } from "@/modules/observability/schemas/search-params";
import { HeadlineBanner } from "@/modules/observability/components/headline-banner";
import { OverviewStats } from "@/modules/observability/components/overview-stats";
import { HourlyPanel } from "@/modules/observability/components/hourly-panel";
import { AiCostPanel } from "@/modules/observability/components/ai-cost-panel";
import { CostByClientPanel } from "@/modules/observability/components/cost-by-client-panel";
import { AttentionPanel } from "@/modules/observability/components/attention-panel";

export async function ObsOverviewPage({ searchParams }: { searchParams: RouteSearchParams }) {
  const { range, brandId } = parseObsSearchParams(await searchParams);
  const overview = await getObsOverview(range, { brandId });
  if (!overview) notFound();

  const totalRequests = overview.requests.reduce((sum, r) => sum + r.count, 0);
  const totalErrors = overview.requests.reduce((sum, r) => sum + r.errors, 0);

  return (
    <>
      <ObsPageHeader />
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
        <CostByClientPanel title="Top clients by AI cost" description="Who the agents worked for today." rows={overview.topClientsByCost} clientsHref={routes.admin.clients.list} />
        <div id="attention">
          <AttentionPanel items={overview.attention} clearedOnTheirOwn={overview.clearedOnTheirOwn} range={range} />
        </div>
      </div>
    </>
  );
}
