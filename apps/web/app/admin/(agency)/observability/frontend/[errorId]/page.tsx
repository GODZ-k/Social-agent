import { notFound } from "next/navigation";
import { getFrontendError } from "@/lib/api/server";
import { ErrorDetailHeader } from "@/features/observability/error-detail-header";
import { ErrorStats } from "@/features/observability/error-stats";
import { HourlyPanel } from "@/features/observability/hourly-panel";
import { WhatPersonDidPanel } from "@/features/observability/what-person-did-panel";
import { StackTracePanel } from "@/features/observability/stack-trace-panel";
import { ErrorDetailsPanel } from "@/features/observability/error-details-panel";
import { WhoHitItPanel } from "@/features/observability/who-hit-it-panel";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function FrontendErrorPage({ params }: { params: Promise<{ errorId: string }> }) {
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
          <WhoHitItPanel clients={error.clients} />
        </div>
      </div>
    </>
  );
}
