import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getBrand, listContent, listReviewQueue } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { WorkspaceHeader } from "@/features/overview/workspace-header";
import { NextStep } from "@/features/overview/next-step";
import { LoopPanel } from "@/features/overview/loop-panel";
import { ThisWeekPanel } from "@/features/overview/this-week-panel";
import { ThisWeekPanelSkeleton } from "@/features/overview/this-week-panel-skeleton";
import { StatTiles } from "@/features/overview/stat-tiles";
import { BrandKitSummary } from "@/features/overview/brand-kit-summary";
import { ReviewPostSheet } from "@/features/post/review-post-sheet";


export default async function OverviewPage({
  params,
  searchParams,
  basePath = "/c",
}: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
  basePath?: WorkspaceBasePath;
}) {
  const [{ brandId }, { post: postId }, viewer] = await Promise.all([params, searchParams, getViewer()]);
  const brand = await getBrand(brandId);
  if (!brand) notFound();
  // An admin's own copy of this route lives at /admin/c/:brandId, with its own chrome. Only redirect
  // when reached from the client tree itself; the admin route composes this same page with its own basePath.
  if (viewer.role === "admin" && basePath === "/c") redirect(`/admin/c/${brandId}`);

  const [reviewPosts, scheduledPosts, failedPosts] = await Promise.all([
    listReviewQueue(brandId),
    listContent(brandId, "scheduled"),
    listContent(brandId, "failed"),
  ]);

  return (
    <div className="grid gap-5">
      <WorkspaceHeader brand={brand} basePath={basePath} />
      <NextStep brand={brand} reviewPosts={reviewPosts} failedPosts={failedPosts} basePath={basePath} />
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
