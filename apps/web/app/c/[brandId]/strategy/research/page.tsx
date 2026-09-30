import { notFound } from "next/navigation";
import { getClient, getResearch } from "@/lib/api/server";
import { PageHeader, EmptyState } from "@repo/ui/components/states";
import { cn } from "@/lib/utils";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { BackToStrategyLink } from "@/features/strategy/back-to-strategy-link";
import { ResearchVersionPill } from "@/features/strategy/research-version-pill";
import { RunResearchButton } from "@/features/strategy/run-research-button";
import { ResearchRunningBanner } from "@/features/strategy/research-running-banner";
import { ResearchFailedBanner } from "@/features/strategy/research-failed-banner";
import { ResearchFindings } from "@/features/research/research-findings";

const DESCRIPTION = "What the agent learned about your market before planning. Your strategy is built on it.";

export default async function StrategyResearchPage({
  params,
  basePath = "/c",
}: {
  params: Promise<{ brandId: string }>;
  basePath?: WorkspaceBasePath;
}) {
  const { brandId } = await params;
  const [client, research] = await Promise.all([getClient(brandId), getResearch(brandId)]);
  if (!client) notFound();

  const isRunning = research?.status === "queued" || research?.status === "running";

  if (!research?.growthBrief) {
    return (
      <>
        <BackToStrategyLink brandId={brandId} basePath={basePath} />
        <PageHeader title="Research" description={DESCRIPTION} actions={!isRunning && <RunResearchButton brandId={brandId} />} />
        {isRunning && <ResearchRunningBanner currentStep={research.currentStep} visibleVersion={0} />}
        {research?.status === "failed" && <ResearchFailedBanner error={research.error} />}
        <EmptyState title="No research yet" description="Research runs before the strategy can be drafted." />
      </>
    );
  }

  return (
    <>
      <BackToStrategyLink brandId={brandId} basePath={basePath} />
      <PageHeader
        title="Research"
        description={DESCRIPTION}
        actions={
          <div className="flex flex-col items-start gap-2.5 min-[561px]:flex-row min-[561px]:items-center">
            <ResearchVersionPill growthBrief={research.growthBrief} />
            {!isRunning && <RunResearchButton brandId={brandId} />}
          </div>
        }
      />
      {isRunning && <ResearchRunningBanner currentStep={research.currentStep} visibleVersion={research.growthBrief.version} />}
      <div className={cn(isRunning && "pointer-events-none opacity-55")} aria-busy={isRunning}>
        <ResearchFindings research={research} />
      </div>
    </>
  );
}
