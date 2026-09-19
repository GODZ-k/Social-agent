"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChartNoAxesCombined, LoaderCircle, RefreshCw } from "lucide-react";
import { analyticsQuery, postsQuery, strategyQuery, useRegenerateStrategy } from "@/lib/api/queries";
import { ApiError } from "@/lib/api/client";
import { useWorkspace } from "@/hooks/use-workspace";
import { formatCompact } from "@/lib/utils";
import { EmptyState, ErrorState, PageHeader, Panel, SkeletonRows } from "@repo/ui/components/states";
import { RankedBars, TrendChart } from "@repo/ui/components/social/charts";
import { LearningItem } from "@/components/strategy/learning-item";
import { FORMAT_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { PostArt } from "@repo/ui/components/social/post-art";
import { Button } from "@repo/ui/components/button";
import { Segmented } from "@repo/ui/components/segmented";

type Metric = "reach" | "engagement" | "followers";
const METRICS: { value: Metric; label: string }[] = [
  { value: "reach", label: "Reach" },
  { value: "engagement", label: "Engagement" },
  { value: "followers", label: "Followers" },
];

const percent = (v: number) => `${v.toFixed(1)}%`;

export default function AnalyticsPage() {
  const { clientId, client } = useWorkspace();
  const analytics = useQuery(analyticsQuery(clientId));
  const { data: posts } = useQuery(postsQuery(clientId));
  const { data: strategy } = useQuery(strategyQuery(clientId));
  const regenerate = useRegenerateStrategy(clientId);
  const [metric, setMetric] = useState<Metric>("reach");

  const data = analytics.data;
  const trend = useMemo(
    () => (data?.series ?? []).map((p) => ({ label: format(new Date(p.date), "d MMM"), value: p[metric] })),
    [data, metric],
  );
  const formats = useMemo(
    () => (data?.byFormat ?? []).map((f) => ({ label: FORMAT_LABEL[f.format], value: f.engagementRate })),
    [data],
  );
  const pillars = useMemo(() => (data?.byPillar ?? []).map((p) => ({ label: p.name, value: p.reach })), [data]);
  const topPosts = useMemo(
    () => (posts ?? []).filter((p) => p.metrics).sort((a, b) => b.metrics!.reach - a.metrics!.reach).slice(0, 5),
    [posts],
  );

  const noData = (analytics.error instanceof ApiError && analytics.error.status === 404) || (data && data.series.length === 0);

  return (
    <>
      <PageHeader title="Analytics" description="How published posts performed over the last 30 days, and what the agent took from it." />

      {analytics.isPending && <SkeletonRows rows={2} className="[&>*]:h-72" />}
      {analytics.error && !noData && <ErrorState error={analytics.error} onRetry={() => analytics.refetch()} />}
      {noData && (
        <EmptyState
          icon={<ChartNoAxesCombined />}
          title="No results yet"
          description="Numbers show up here about a day after the first post is published."
          action={<Button asChild><Link href={`/c/${clientId}/approvals`}>Review waiting posts</Link></Button>}
        />
      )}

      {data && !noData && (
        <div className="grid gap-5">
          <Panel aria-labelledby="trend-heading">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="trend-heading" className="type-heading">Last 30 days</h2>
              <Segmented label="Metric" value={metric} onValueChange={setMetric} options={METRICS} />
            </div>
            <TrendChart
              rows={trend}
              metric={METRICS.find((m) => m.value === metric)!.label}
              formatValue={metric === "engagement" ? percent : undefined}
            />
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel aria-labelledby="format-heading">
              <h2 id="format-heading" className="type-heading">Engagement by format</h2>
              <p className="type-label mt-1 mb-3">Average engagement rate per post.</p>
              <RankedBars rows={formats} metric="Engagement rate" formatValue={percent} />
            </Panel>
            <Panel aria-labelledby="pillar-heading">
              <h2 id="pillar-heading" className="type-heading">Reach by pillar</h2>
              <p className="type-label mt-1 mb-3">Total accounts reached by each content theme.</p>
              <RankedBars rows={pillars} metric="Reach" />
            </Panel>
          </div>

          <Panel aria-labelledby="top-heading">
            <h2 id="top-heading" className="type-heading mb-4">Best performing posts</h2>
            <ol className="grid gap-1">
              {topPosts.map((post, i) => (
                <li key={post.id} className="flex items-center gap-4 rounded-lg py-2">
                  <span className="type-number w-5 text-center text-muted-foreground">{i + 1}</span>
                  {client && <PostArt post={post} brand={client.brand} fixedAspect="aspect-square" className="w-12 shrink-0 rounded-md" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{post.hook}</p>
                    <p className="type-label flex items-center gap-1.5">
                      <PlatformIcon platform={post.platform} className="size-3.5" />
                      {FORMAT_LABEL[post.format]}, {format(new Date(post.publishedAt!), "d MMM")}
                    </p>
                  </div>
                  <dl className="flex gap-5 text-right">
                    <div><dd className="type-number">{formatCompact(post.metrics!.reach)}</dd><dt className="type-label">reach</dt></div>
                    <div className="max-sm:hidden"><dd className="type-number">{formatCompact(post.metrics!.saves)}</dd><dt className="type-label">saves</dt></div>
                  </dl>
                </li>
              ))}
            </ol>
          </Panel>

          {strategy && strategy.learnings.length > 0 && (
            <Panel aria-labelledby="learned-heading" className="bg-tint shadow-none">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 id="learned-heading" className="type-heading text-tint-foreground">What the agent learned</h2>
                  <p className="mt-1 text-tint-foreground/80">These findings go into the next version of the strategy.</p>
                </div>
                <Button onClick={() => regenerate.mutate()} disabled={regenerate.isPending}>
                  {regenerate.isPending ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
                  {regenerate.isPending ? "Rewriting the strategy" : "Rewrite the strategy"}
                </Button>
              </div>
              <ul className="grid gap-x-8 gap-y-5 md:grid-cols-2">
                {strategy.learnings.map((l) => <LearningItem key={l.id} learning={l} />)}
              </ul>
            </Panel>
          )}
        </div>
      )}
    </>
  );
}
