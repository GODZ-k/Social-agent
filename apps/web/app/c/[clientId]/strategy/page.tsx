import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, getStrategy } from "@/lib/api/server";
import { StrategyRefresh } from "@/features/strategy/strategy-refresh";
import { GoalPanel } from "@/features/strategy/goal-panel";
import { PillarsPanel } from "@/features/strategy/pillars-panel";
import { CadencePanel } from "@/features/strategy/cadence-panel";
import { AudiencePanel } from "@/features/strategy/audience-panel";
import { LearningsPanel } from "@/features/strategy/learnings-panel";
import { EmptyState } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";


// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function StrategyPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const [client, strategy] = await Promise.all([getClient(clientId), getStrategy(clientId)]);
  if (!client) notFound();

  if (!strategy) {
    return (
      <StrategyRefresh clientId={clientId} disabled>
        <EmptyState
          title="No strategy yet"
          description="No strategy has been generated for this client yet."
          action={<Button asChild><Link href={`/c/${clientId}`}>Back to overview</Link></Button>}
        />
      </StrategyRefresh>
    );
  }

  return (
    <StrategyRefresh clientId={clientId}>
      <GoalPanel strategy={strategy} />
      <PillarsPanel pillars={strategy.pillars} />
      <div className="grid gap-5 lg:grid-cols-2">
        <CadencePanel cadence={strategy.cadence} />
        <AudiencePanel audience={strategy.audience} />
      </div>
      <LearningsPanel clientId={clientId} learnings={strategy.learnings} />
    </StrategyRefresh>
  );
}
