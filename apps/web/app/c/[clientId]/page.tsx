import { notFound } from "next/navigation";
import { getClient, listPosts } from "@/lib/api/server";
import { WorkspaceHeader } from "@/features/overview/workspace-header";
import { NextStep } from "@/features/overview/next-step";
import { LoopPanel } from "@/features/overview/loop-panel";
import { Metrics } from "@/features/overview/metrics";
import { UpcomingPosts } from "@/features/overview/upcoming-posts";
import { BrandKitSummary } from "@/features/overview/brand-kit-summary";

export default async function OverviewPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const [client, posts] = await Promise.all([getClient(clientId), listPosts(clientId)]);
  if (!client) notFound();

  return (
    <div className="grid gap-5">
      <WorkspaceHeader client={client} />
      <NextStep client={client} />
      <LoopPanel stage={client.stage} />
      <Metrics stats={client.stats} />
      <UpcomingPosts clientId={clientId} posts={posts} brand={client.brand} />
      <BrandKitSummary brand={client.brand} />
    </div>
  );
}
