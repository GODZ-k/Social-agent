"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { strategyQuery, useRegenerateStrategy } from "@/lib/api/queries";
import { useWorkspace } from "@/hooks/use-workspace";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ErrorState, PageHeader, Panel, SkeletonRows } from "@/components/shell/states";
import { PLATFORM_LABEL, PlatformIcon } from "@/components/post/platform";
import { LearningItem } from "@/components/strategy/learning-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function StrategyPage() {
  const { clientId } = useWorkspace();
  const { data: strategy, isPending, error, refetch } = useQuery(strategyQuery(clientId));
  const regenerate = useRegenerateStrategy(clientId);

  return (
    <>
      <PageHeader
        title="Strategy"
        description="What the agent plans to post, how often, and why. It rewrites this each time results come in."
        actions={
          <Button variant="outline" onClick={() => regenerate.mutate()} disabled={regenerate.isPending || !strategy}>
            {regenerate.isPending ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
            {regenerate.isPending ? "Rewriting from latest results" : "Rewrite from latest results"}
          </Button>
        }
      />

      {isPending && <SkeletonRows rows={3} className="[&>*]:h-40" />}
      {error && <ErrorState error={error} onRetry={() => refetch()} />}

      {strategy && (
        <div
          className={cn("grid gap-5 transition-opacity duration-300", regenerate.isPending && "opacity-55")}
          aria-busy={regenerate.isPending}
        >
          <Panel className="bg-tint shadow-none">
            <div className="mb-3 flex flex-wrap items-center gap-2.5">
              <Badge variant="tint" className="bg-tint-strong">Version {strategy.version}</Badge>
              <span className="type-label">
                Written {formatDistanceToNow(new Date(strategy.generatedAt), { addSuffix: true })}
              </span>
            </div>
            <p className="max-w-[40ch] font-display text-[1.375rem] leading-[1.2] font-semibold tracking-[-0.02em] text-tint-foreground md:text-[1.75rem]">
              {strategy.goal}
            </p>
          </Panel>

          <Panel aria-labelledby="pillars-heading">
            <h2 id="pillars-heading" className="type-heading">Content pillars</h2>
            <p className="type-label mt-1 mb-6">The themes every post belongs to, and how much of the month each one gets.</p>
            <ul className="grid gap-6">
              {strategy.pillars.map((pillar) => (
                <li key={pillar.id} className="grid gap-x-6 gap-y-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center">
                  <div>
                    <p className="font-medium">{pillar.name}</p>
                    <p className="type-label mt-0.5">{pillar.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      {/* Slides rather than resizes, so only transform animates. */}
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={false}
                        animate={{ x: `${pillar.share - 100}%` }}
                        transition={spring.smooth}
                      />
                    </div>
                    <span className="type-number w-11 text-right text-[1.0625rem]">{pillar.share}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel aria-labelledby="cadence-heading">
              <h2 id="cadence-heading" className="type-heading mb-5">Posting rhythm</h2>
              <ul className="grid gap-5">
                {strategy.cadence.map((c) => (
                  <li key={c.platform} className="flex items-start gap-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-tint text-tint-foreground">
                      <PlatformIcon platform={c.platform} className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">
                        {PLATFORM_LABEL[c.platform]}, {c.perWeek} times a week
                      </p>
                      <p className="type-label mt-0.5">Best at {c.bestTimes.join(", ")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel aria-labelledby="audience-heading">
              <h2 id="audience-heading" className="type-heading mb-5">Who it&apos;s talking to</h2>
              <dl className="grid gap-4">
                {strategy.audience.map((a) => (
                  <div key={a.segment}>
                    <dt className="type-label">{a.segment}</dt>
                    <dd>{a.note}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </div>

          <Panel aria-labelledby="learnings-heading">
            <h2 id="learnings-heading" className="type-heading">What the agent has learned</h2>
            <p className="type-label mt-1 mb-5">Findings from published posts. Each one shaped this version of the strategy.</p>
            {strategy.learnings.length === 0 ? (
              <p className="text-muted-foreground">
                Nothing yet. Findings appear here once the first posts have been live for a week.{" "}
                <Link href={`/c/${clientId}/content`} className="font-medium text-tint-foreground hover:underline">
                  Draft the first posts
                </Link>
              </p>
            ) : (
              <ul className="grid gap-x-8 gap-y-5 md:grid-cols-2">
                {strategy.learnings.map((l) => (
                  <LearningItem key={l.id} learning={l} />
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
