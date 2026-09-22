import { Suspense } from "react";
import Link from "next/link";
import { ChartNoAxesCombined } from "lucide-react";
import { getAnalytics } from "@/lib/api/server";
import type { BrandKit } from "@/lib/types";
import { EmptyState, SkeletonRows } from "@repo/ui/components/states";
import { PanelBoundary } from "@repo/ui/components/error-boundary";
import { Button } from "@repo/ui/components/button";
import { TrendPanel } from "./trend-panel";
import { FormatPanel } from "./format-panel";
import { PillarPanel } from "./pillar-panel";
import { TopPosts } from "./top-posts";
import { LearnedSection } from "./learned-section";

/**
 * Reads the analytics and decides between the empty state and the charts.
 * The two panels below the charts read their own data and stream in behind
 * their own boundaries, so a slow or failed one never holds the charts back.
 */
export async function AnalyticsBody({ clientId, brand }: { clientId: string; brand: BrandKit }) {
  const analytics = await getAnalytics(clientId);
  if (!analytics || analytics.series.length === 0) {
    return (
      <EmptyState
        icon={<ChartNoAxesCombined />}
        title="No results yet"
        description="Numbers show up here about a day after the first post is published."
        action={<Button asChild><Link href={`/c/${clientId}/approvals`}>Review waiting posts</Link></Button>}
      />
    );
  }

  return (
    <div className="grid gap-5">
      <TrendPanel series={analytics.series} />
      <div className="grid gap-5 lg:grid-cols-2">
        <FormatPanel byFormat={analytics.byFormat} />
        <PillarPanel byPillar={analytics.byPillar} />
      </div>
      <PanelBoundary label="Best performing posts">
        <Suspense fallback={<SkeletonRows rows={1} className="[&>*]:h-80" />}>
          <TopPosts clientId={clientId} brand={brand} />
        </Suspense>
      </PanelBoundary>
      <PanelBoundary label="What the agent learned">
        <Suspense fallback={<SkeletonRows rows={1} className="[&>*]:h-48" />}>
          <LearnedSection clientId={clientId} />
        </Suspense>
      </PanelBoundary>
    </div>
  );
}
