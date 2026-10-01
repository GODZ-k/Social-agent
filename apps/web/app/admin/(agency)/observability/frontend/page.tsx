import { notFound } from "next/navigation";
import { getObsFrontend, getObsOverview } from "@/lib/api/server";
import { ObsPageHeader } from "@/features/observability/obs-page-header";
import { ObsTabs } from "@/features/observability/obs-tabs";
import { parseObsSearchParams } from "@/features/observability/search-params";
import { ReleaseCheckPanel } from "@/features/observability/release-check-panel";
import { FrontendStats } from "@/features/observability/frontend-stats";
import { HourlyPanel } from "@/features/observability/hourly-panel";
import { ErrorsByPagePanel } from "@/features/observability/errors-by-page-panel";
import { FrontendErrorsPanel } from "@/features/observability/frontend-errors-panel";
import { FailedActionsPanel } from "@/features/observability/failed-actions-panel";
import { FailedApiCallsPanel } from "@/features/observability/failed-api-calls-panel";

export default async function ObservabilityFrontendPage({ searchParams }: { searchParams: Promise<{ range?: string; brand?: string; release?: string }> }) {
  const params = await searchParams;
  const { range, brandId } = parseObsSearchParams(params);
  const [frontend, overview] = await Promise.all([getObsFrontend(range, { brandId, releaseId: params.release ?? null }), getObsOverview(range, { brandId })]);
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
