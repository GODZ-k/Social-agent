import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrand, getResearch, getStrategy } from "@/lib/api/server";
import { PageHeader, EmptyState } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { deriveRun } from "@/components/run/run-steps";
import { RunProgressPanel } from "@/components/run/run-progress-panel";
import { StrategyBanner } from "@/modules/strategy/components/strategy-banner";
import { WhyThisPlan } from "@/modules/strategy/components/why-this-plan";
import { VersionChangesPanel } from "@/modules/strategy/components/version-changes-panel";
import { PillarsPanel } from "@/modules/strategy/components/pillars-panel";
import { PostingTimesPanel } from "@/modules/strategy/components/posting-times-panel";
import { AudiencePanel } from "@/modules/strategy/components/audience-panel";
import { LearningsPanel } from "@/modules/strategy/components/learnings-panel";
import { routes, workspaceRoutes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

export default async function StrategyPage({
  params,
  searchParams,
  basePath = routes.brand.base,
}: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ ask?: string }>;
  basePath?: WorkspaceBase;
}) {
  const [{ brandId }, { ask }] = await Promise.all([params, searchParams]);
  const [brand, strategy, research] = await Promise.all([getBrand(brandId), getStrategy(brandId), getResearch(brandId)]);
  if (!brand) notFound();

  if (!strategy) {
    const run = deriveRun(research, strategy);
    return (
      <>
        <PageHeader title="Strategy" description="What the agent will post, how often and why." />
        {run ? (
          <RunProgressPanel run={run} />
        ) : (
          <EmptyState
            title="No strategy yet"
            description="No strategy has been drafted for this brand yet."
            action={
              <Button asChild>
                <Link href={workspaceRoutes(basePath).overview(brandId)}>Back to overview</Link>
              </Button>
            }
          />
        )}
      </>
    );
  }

  const postingStartsAt = strategy.activatedAt ?? strategy.autoStartsAt;

  return (
    <>
      <PageHeader title="Strategy" description="What the agent will post, how often and why." />
      <div className="grid gap-5">
        <StrategyBanner strategy={strategy} askOpen={ask === "1"} basePath={basePath} />
        <WhyThisPlan brandId={brandId} research={research} basePath={basePath} />
        <VersionChangesPanel strategy={strategy} />
        <div className="grid gap-5 lg:grid-cols-2">
          <PillarsPanel pillars={strategy.pillars} />
          <PostingTimesPanel cadence={strategy.cadence} />
        </div>
        <AudiencePanel audience={strategy.audience} />
        {strategy.version <= 1 && <LearningsPanel learnings={strategy.learnings} postingStartsAt={postingStartsAt} />}
      </div>
    </>
  );
}
