import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, getResearch, getStrategy } from "@/lib/api/server";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";
import { PageHeader, EmptyState } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { StrategyBanner } from "@/features/strategy/strategy-banner";
import { WhyThisPlan } from "@/features/strategy/why-this-plan";
import { PillarsPanel } from "@/features/strategy/pillars-panel";
import { PostingTimesPanel } from "@/features/strategy/posting-times-panel";
import { AudiencePanel } from "@/features/strategy/audience-panel";
import { LearningsPanel } from "@/features/strategy/learnings-panel";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function StrategyPage({
  params,
  searchParams,
  basePath = "/c",
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ ask?: string }>;
  basePath?: WorkspaceBasePath;
}) {
  const [{ clientId }, { ask }] = await Promise.all([params, searchParams]);
  const [client, strategy, research] = await Promise.all([getClient(clientId), getStrategy(clientId), getResearch(clientId)]);
  if (!client) notFound();

  if (!strategy) {
    return (
      <>
        <PageHeader title="Strategy" description="What the agent will post, how often and why." />
        <EmptyState
          title="No strategy yet"
          description="No strategy has been drafted for this brand yet."
          action={
            <Button asChild>
              <Link href={workspaceHref(basePath, clientId)}>Back to overview</Link>
            </Button>
          }
        />
      </>
    );
  }

  const postingStartsAt = strategy.activatedAt ?? strategy.autoStartsAt;

  return (
    <>
      <PageHeader title="Strategy" description="What the agent will post, how often and why." />
      <div className="grid gap-5">
        <StrategyBanner strategy={strategy} askOpen={ask === "1"} basePath={basePath} />
        <WhyThisPlan clientId={clientId} research={research} basePath={basePath} />
        <div className="grid gap-5 lg:grid-cols-2">
          <PillarsPanel pillars={strategy.pillars} />
          <PostingTimesPanel cadence={strategy.cadence} />
        </div>
        <AudiencePanel audience={strategy.audience} />
        <LearningsPanel learnings={strategy.learnings} postingStartsAt={postingStartsAt} />
      </div>
    </>
  );
}
