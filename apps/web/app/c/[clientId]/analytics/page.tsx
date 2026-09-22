import Link from "next/link";
import { notFound } from "next/navigation";
import { ChartNoAxesCombined } from "lucide-react";
import { getAnalytics, getClient, getStrategy, listPosts } from "@/lib/api/server";
import { TrendPanel } from "@/features/analytics/trend-panel";
import { FormatPanel } from "@/features/analytics/format-panel";
import { PillarPanel } from "@/features/analytics/pillar-panel";
import { TopPosts } from "@/features/analytics/top-posts";
import { LearnedPanel } from "@/features/analytics/learned-panel";
import { EmptyState, PageHeader } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";

export default async function AnalyticsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const [client, analytics, posts, strategy] = await Promise.all([
    getClient(clientId),
    getAnalytics(clientId),
    listPosts(clientId),
    getStrategy(clientId),
  ]);
  if (!client) notFound();

  const noData = !analytics || analytics.series.length === 0;

  return (
    <>
      <PageHeader title="Analytics" description="How published posts performed over the last 30 days, and what the agent took from it." />

      {noData ? (
        <EmptyState
          icon={<ChartNoAxesCombined />}
          title="No results yet"
          description="Numbers show up here about a day after the first post is published."
          action={<Button asChild><Link href={`/c/${clientId}/approvals`}>Review waiting posts</Link></Button>}
        />
      ) : (
        <div className="grid gap-5">
          <TrendPanel series={analytics.series} />
          <div className="grid gap-5 lg:grid-cols-2">
            <FormatPanel byFormat={analytics.byFormat} />
            <PillarPanel byPillar={analytics.byPillar} />
          </div>
          <TopPosts posts={posts} brand={client.brand} />
          {strategy && strategy.learnings.length > 0 && <LearnedPanel clientId={clientId} learnings={strategy.learnings} />}
        </div>
      )}
    </>
  );
}
