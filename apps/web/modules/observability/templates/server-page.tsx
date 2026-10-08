import { notFound } from "next/navigation";
import { getObsOverview, getObsServer } from "@/lib/api/server";
import type { RouteSearchParams } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { ObsPageHeader } from "@/modules/observability/components/obs-page-header";
import { ObsTabs } from "@/modules/observability/components/obs-tabs";
import { parseObsSearchParams } from "@/modules/observability/schemas/search-params";
import { ServerStats } from "@/modules/observability/components/server-stats";
import { HourlyPanel } from "@/modules/observability/components/hourly-panel";
import { RoutesPanel } from "@/modules/observability/components/routes-panel";
import { JobsPanel, ServicesPanel, ServerErrorsPanel, SlowRequestsPanel } from "@/modules/observability/components/list-panels";
import { LogsPanel } from "@/modules/observability/components/logs-panel";
import { formatMs } from "@/modules/observability/utils/format";

export async function ObsServerPage({ searchParams }: { searchParams: RouteSearchParams }) {
  const { range, brandId } = parseObsSearchParams(await searchParams);
  const [server, overview] = await Promise.all([getObsServer(range, { brandId }), getObsOverview(range, { brandId })]);
  if (!server || !overview) notFound();

  const totalRequests = server.hourly.reduce((sum, h) => sum + h.count, 0);
  const totalErrors = server.hourly.reduce((sum, h) => sum + h.errors, 0);
  const typicalMs = Math.round(server.hourly.reduce((sum, h) => sum + h.p50, 0) / server.hourly.length);

  return (
    <>
      <ObsPageHeader />
      <ObsTabs active="server" checkedAt={overview.checkedAt} range={range} brandId={brandId} />
      <ServerStats server={server} range={range} />
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <HourlyPanel
          title="Requests over time"
          description="Requests and server errors per hour."
          total={formatNumber(totalRequests)}
          caption="Total requests"
          rows={server.hourly.map((h) => ({ at: h.at, primary: h.count, secondary: h.errors }))}
          primaryLabel={`Requests ${formatNumber(totalRequests)}`}
          secondaryLabel={`Server errors ${formatNumber(totalErrors)}`}
          secondaryColor="var(--destructive)"
        />
        <HourlyPanel
          title="Latency"
          description="How long a request takes, per hour."
          total={formatMs(typicalMs)}
          caption="Typical request"
          rows={server.hourly.map((h) => ({ at: h.at, primary: h.p50, secondary: h.p95 }))}
          primaryLabel={`Typical (p50) ${formatMs(typicalMs)}`}
          secondaryLabel={`Slowest 5% (p95) ${formatMs(server.p95Ms.value)}`}
          formatValue={formatMs}
        />
      </div>
      <div className="mt-5">
        <RoutesPanel routes={server.routes} />
      </div>
      <div className="mt-5">
        <JobsPanel jobs={server.jobs} />
      </div>
      <div className="mt-5">
        <ServicesPanel services={server.services} />
      </div>
      <div className="mt-5">
        <ServerErrorsPanel errors={server.errorGroups} />
      </div>
      <div className="mt-5">
        <SlowRequestsPanel requests={server.slowRequests} />
      </div>
      <div className="mt-5">
        <LogsPanel logs={server.logs} />
      </div>
    </>
  );
}
