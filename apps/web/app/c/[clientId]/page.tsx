import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getClient, listContent, listReviewQueue } from "@/lib/api/server";
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


// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function OverviewPage({
  params,
  searchParams,
  basePath = "/c",
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ post?: string }>;
  basePath?: WorkspaceBasePath;
}) {
  const [{ clientId }, { post: postId }, viewer] = await Promise.all([params, searchParams, getViewer()]);
  const client = await getClient(clientId);
  if (!client) notFound();
  // An admin's own copy of this route lives at /admin/c/:clientId, with its own chrome. Only redirect
  // when reached from the client tree itself; the admin route composes this same page with its own basePath.
  if (viewer.role === "admin" && basePath === "/c") redirect(`/admin/c/${clientId}`);

  const [reviewPosts, scheduledPosts] = await Promise.all([listReviewQueue(clientId), listContent(clientId, "scheduled")]);

  return (
    <div className="grid gap-5">
      <WorkspaceHeader client={client} basePath={basePath} />
      <NextStep client={client} reviewPosts={reviewPosts} basePath={basePath} />
      <LoopPanel stage={client.stage} />
      {/* The week's posts stream in on their own; the header and stats never wait for them. */}
      <Suspense fallback={<ThisWeekPanelSkeleton clientId={clientId} basePath={basePath} />}>
        <ThisWeekPanel clientId={clientId} brand={client.brand} basePath={basePath} />
      </Suspense>
      <StatTiles client={client} reviewPosts={reviewPosts} scheduledPosts={scheduledPosts} basePath={basePath} />
      <BrandKitSummary brand={client.brand} clientId={clientId} basePath={basePath} />
      {postId && <ReviewPostSheet postId={postId} />}
    </div>
  );
}
