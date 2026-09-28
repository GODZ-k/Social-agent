import { notFound } from "next/navigation";
import { getObsOverview, getObsServer } from "@/lib/api/server";
import { PageHeader } from "@repo/ui/components/states";
import { formatNumber } from "@/lib/utils";
import { ObsTabs } from "@/features/observability/obs-tabs";
import { parseObsSearchParams } from "@/features/observability/search-params";
import { ServerStats } from "@/features/observability/server-stats";
import { HourlyPanel } from "@/features/observability/hourly-panel";
import { RoutesPanel } from "@/features/observability/routes-panel";
import { JobsPanel } from "@/features/observability/jobs-panel";
import { ServicesPanel } from "@/features/observability/services-panel";
import { ServerErrorsPanel } from "@/features/observability/server-errors-panel";
import { SlowRequestsPanel } from "@/features/observability/slow-requests-panel";
import { LogsPanel } from "@/features/observability/logs-panel";
import { formatMs } from "@/features/observability/format";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ObservabilityServerPage({ searchParams }: { searchParams: Promise<{ range?: string; brand?: string }> }) {
  const { range, brandId } = parseObsSearchParams(await searchParams);
  const [server, overview] = await Promise.all([getObsServer(range, { brandId }), getObsOverview(range, { brandId })]);
  if (!server || !overview) notFound();

  const totalRequests = server.hourly.reduce((sum, h) => sum + h.count, 0);
  const totalErrors = server.hourly.reduce((sum, h) => sum + h.errors, 0);
  const typicalMs = Math.round(server.hourly.reduce((sum, h) => sum + h.p50, 0) / server.hourly.length);

  return (
    <>
      <PageHeader title="Observability" description="How the app, the server and the AI agents are doing, across every client." />
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
