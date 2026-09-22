import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getClient } from "@/lib/api/server";
import { WorkspaceHeader } from "@/features/overview/workspace-header";
import { NextStep } from "@/features/overview/next-step";
import { LoopPanel } from "@/features/overview/loop-panel";
import { Metrics } from "@/features/overview/metrics";
import { UpcomingPosts } from "@/features/overview/upcoming-posts";
import { UpcomingPostsSkeleton } from "@/features/overview/upcoming-posts-skeleton";
import { BrandKitSummary } from "@/features/overview/brand-kit-summary";

export default async function OverviewPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const client = await getClient(clientId);
  if (!client) notFound();

  return (
    <div className="grid gap-5">
      <WorkspaceHeader client={client} />
      <NextStep client={client} />
      <LoopPanel stage={client.stage} />
      <Metrics stats={client.stats} />
      {/* Posts stream in on their own; the header and metrics never wait for them. */}
      <Suspense fallback={<UpcomingPostsSkeleton clientId={clientId} />}>
        <UpcomingPosts clientId={clientId} brand={client.brand} />
      </Suspense>
      <BrandKitSummary brand={client.brand} />
    </div>
  );
}
