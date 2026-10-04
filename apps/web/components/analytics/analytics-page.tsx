import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBrand } from "@/lib/api/server";
import { AnalyticsBody } from "@/features/analytics/analytics-body";
import type { AnalyticsRange } from "@/lib/types";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { PageHeader, SkeletonRows } from "@repo/ui/components/states";

export default async function AnalyticsPage({
  params,
  searchParams,
  basePath = "/c",
}: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ range?: string }>;
  basePath?: WorkspaceBasePath;
}) {
  const [{ brandId }, { range: rangeParam }] = await Promise.all([params, searchParams]);
  const brand = await getBrand(brandId);
  if (!brand) notFound();
  const range = rangeOf(rangeParam);

  return (
    <>
      <PageHeader title="Analytics" description="How your posts did, in plain numbers, and what the agent changed because of it." />
      <Suspense fallback={<SkeletonRows rows={2} className="[&>*]:h-72" />}>
        <AnalyticsBody brandId={brandId} brand={brand} basePath={basePath} range={range} />
      </Suspense>
    </>
  );
}

function rangeOf(value: string | undefined): AnalyticsRange {
  const parsed = Number(value);
  return parsed === 7 || parsed === 90 ? parsed : 30;
}
