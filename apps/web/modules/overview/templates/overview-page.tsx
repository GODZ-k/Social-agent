import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getBrand, getResearch, getStrategy, listContent, listReviewQueue } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import { deriveRun } from "@/components/run/run-steps";
import { RunHero } from "@/components/run/run-hero";
import { WorkspaceHeader } from "@/modules/overview/components/workspace-header";
import { NextStep } from "@/modules/overview/components/next-step";
import { LoopPanel } from "@/modules/overview/components/loop-panel";
import { ThisWeekPanel } from "@/modules/overview/components/this-week-panel";
import { ThisWeekPanelSkeleton } from "@/modules/overview/components/this-week-panel-skeleton";
import { StatTiles } from "@/modules/overview/components/stat-tiles";
import { BrandKitSummary } from "@/modules/overview/components/brand-kit-summary";
import { ReviewPostSheet } from "@/components/post/review-post-sheet";
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";


export default async function OverviewPage({
  params,
  searchParams,
  basePath = routes.brand.base,
}: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
  basePath?: WorkspaceBase;
}) {
  const [{ brandId }, { post: postId }, viewer] = await Promise.all([params, searchParams, getViewer()]);
  const brand = await getBrand(brandId);
  if (!brand) notFound();
  if (viewer.role === "admin" && basePath === routes.brand.base) redirect(routes.admin.brand.overview(brandId));

  const [reviewPosts, scheduledPosts, failedPosts, research, strategy] = await Promise.all([
    listReviewQueue(brandId),
    listContent(brandId, "scheduled"),
    listContent(brandId, "failed"),
    getResearch(brandId),
    getStrategy(brandId),
  ]);
  const run = deriveRun(research, strategy);

  return (
    <div className="grid gap-5">
      <WorkspaceHeader brand={brand} basePath={basePath} />
      {run ? (
        <RunHero run={run} brandId={brandId} basePath={basePath} />
      ) : (
        <NextStep brand={brand} reviewPosts={reviewPosts} failedPosts={failedPosts} basePath={basePath} />
      )}
      <LoopPanel stage={brand.stage} />
      {/* The week's posts stream in on their own; the header and stats never wait for them. */}
      <Suspense fallback={<ThisWeekPanelSkeleton brandId={brandId} basePath={basePath} />}>
        <ThisWeekPanel brandId={brandId} brand={brand.brand} basePath={basePath} />
      </Suspense>
      <StatTiles brand={brand} reviewPosts={reviewPosts} scheduledPosts={scheduledPosts} basePath={basePath} />
      <BrandKitSummary brand={brand.brand} brandId={brandId} basePath={basePath} />
      {postId && <ReviewPostSheet postId={postId} />}
    </div>
  );
}
