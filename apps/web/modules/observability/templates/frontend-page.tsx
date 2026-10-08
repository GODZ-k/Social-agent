import { notFound } from "next/navigation";
import { getObsFrontend, getObsOverview } from "@/lib/api/server";
import type { RouteSearchParams } from "@/lib/types";
import { ObsPageHeader } from "@/modules/observability/components/obs-page-header";
import { ObsTabs } from "@/modules/observability/components/obs-tabs";
import { parseObsSearchParams } from "@/modules/observability/schemas/search-params";
import { ReleaseCheckPanel } from "@/modules/observability/components/release-check-panel";
import { FrontendStats } from "@/modules/observability/components/frontend-stats";
import { HourlyPanel } from "@/modules/observability/components/hourly-panel";
import { ErrorsByPagePanel } from "@/modules/observability/components/errors-by-page-panel";
import { FrontendErrorsPanel } from "@/modules/observability/components/frontend-errors-panel";
import { FailedActionsPanel } from "@/modules/observability/components/list-panels";
import { FailedApiCallsPanel } from "@/modules/observability/components/failed-api-calls-panel";

export async function ObsFrontendPage({ searchParams }: { searchParams: RouteSearchParams }) {
  const { range, brandId, releaseId } = parseObsSearchParams(await searchParams);
  const [frontend, overview] = await Promise.all([getObsFrontend(range, { brandId, releaseId }), getObsOverview(range, { brandId })]);
  if (!frontend || !overview) notFound();

  const totalSessionsWithError = frontend.sessionsWithError.reduce((sum, s) => sum + s.count, 0);
  const newErrorsCount = frontend.errors.filter((e) => e.newInRelease && e.status === "unresolved").length;

  return (
    <>
      <ObsPageHeader />
      <ObsTabs active="frontend" checkedAt={overview.checkedAt} range={range} brandId={brandId} releases={frontend.releases} activeReleaseId={frontend.release.id} />
      <ReleaseCheckPanel release={frontend.release} releaseCheck={frontend.releaseCheck} newErrorsCount={newErrorsCount} />
      <FrontendStats frontend={frontend} range={range} />
      <div className="mt-5 grid gap-5 lg:grid-cols-[2fr_1fr]">
        <HourlyPanel
          title="Sessions with an error"
          description="Per hour. The dashed line is the last release."
          total={totalSessionsWithError}
          caption="Sessions"
          rows={frontend.sessionsWithError.map((s) => ({ at: s.at, primary: s.count }))}
          primaryLabel="Sessions with an error"
          primaryColor="var(--destructive)"
          releaseAt={frontend.release.at}
        />
        <ErrorsByPagePanel rows={frontend.errorsByPage} />
      </div>
      <div className="mt-5">
        <FrontendErrorsPanel errors={frontend.errors} hiddenNoise={frontend.hiddenNoise} />
      </div>
      <div className="mt-5">
        <FailedActionsPanel actions={frontend.actions} />
      </div>
      <div className="mt-5">
        <FailedApiCallsPanel calls={frontend.apiCalls} />
      </div>
    </>
  );
}
