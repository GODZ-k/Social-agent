import { notFound } from "next/navigation";
import { getFrontendError } from "@/lib/api/server";
import { ErrorDetailHeader } from "@/modules/observability/components/error-detail-header";
import { ErrorStats } from "@/modules/observability/components/error-stats";
import { HourlyPanel } from "@/modules/observability/components/hourly-panel";
import { WhatPersonDidPanel } from "@/modules/observability/components/what-person-did-panel";
import { StackTracePanel } from "@/modules/observability/components/stack-trace-panel";
import { ErrorDetailsPanel } from "@/modules/observability/components/error-details-panel";
import { WhoHitItPanel } from "@/modules/observability/components/list-panels";

export async function FrontendErrorPage({ params }: { params: Promise<{ errorId: string }> }) {
  const { errorId } = await params;
  const error = await getFrontendError(errorId);
  if (!error) notFound();

  const totalHits = error.hourly.reduce((sum, h) => sum + h.count, 0);

  return (
    <>
      <ErrorDetailHeader error={error} />
      <ErrorStats error={error} />
      <div className="mt-5">
        <HourlyPanel
          title="When it happened"
          description="Times per hour."
          total={totalHits}
          rows={error.hourly.map((h) => ({ at: h.at, primary: h.count }))}
          primaryLabel="Times"
        />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="grid gap-5 content-start">
          <WhatPersonDidPanel steps={error.steps} />
          <StackTracePanel message={error.message} stack={error.stack} foldedLibraryLines={error.foldedLibraryLines} />
        </div>
        <div className="grid gap-5 content-start">
          <ErrorDetailsPanel error={error} />
          <WhoHitItPanel brands={error.brands} />
        </div>
      </div>
    </>
  );
}
