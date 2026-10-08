import { notFound } from "next/navigation";
import { getBrand, getResearch } from "@/lib/api/server";
import { PageHeader, EmptyState } from "@repo/ui/components/states";
import { cn } from "@/lib/utils";
import { BackLink } from "@/components/common/back-link";
import { ResearchVersionPill } from "@/modules/strategy/components/research-version-pill";
import { RunResearchButton } from "@/modules/strategy/components/run-research-button";
import { ResearchRunningBanner } from "@/modules/strategy/components/research-running-banner";
import { ResearchFailedBanner } from "@/modules/strategy/components/research-failed-banner";
import { ResearchFindings } from "@/modules/strategy/components/research/research-findings";
import { routes, workspaceRoutes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

const DESCRIPTION = "What the agent learned about your market before planning. Your strategy is built on it.";

export default async function StrategyResearchPage({
  params,
  basePath = routes.brand.base,
}: {
  params: Promise<{ brandId: string }>;
  basePath?: WorkspaceBase;
}) {
  const { brandId } = await params;
  const [brand, research] = await Promise.all([getBrand(brandId), getResearch(brandId)]);
  if (!brand) notFound();

  const isRunning = research?.status === "queued" || research?.status === "running";
  const strategyHref = workspaceRoutes(basePath).strategy(brandId);

  if (!research?.growthBrief) {
    return (
      <>
        <BackLink href={strategyHref} label="Strategy" className="mb-3" />
        <PageHeader title="Research" description={DESCRIPTION} actions={!isRunning && <RunResearchButton brandId={brandId} />} />
        {isRunning && <ResearchRunningBanner currentStep={research.currentStep} visibleVersion={0} />}
        {research?.status === "failed" && <ResearchFailedBanner error={research.error} />}
        <EmptyState title="No research yet" description="Research runs before the strategy can be drafted." />
      </>
    );
  }

  return (
    <>
      <BackLink href={strategyHref} label="Strategy" className="mb-3" />
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
