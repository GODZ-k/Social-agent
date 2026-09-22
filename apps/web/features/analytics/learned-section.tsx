import { getStrategy } from "@/lib/api/server";
import { LearnedPanel } from "./learned-panel";

/** Reads the strategy itself; renders nothing until there is at least one learning. */
export async function LearnedSection({ clientId }: { clientId: string }) {
  const strategy = await getStrategy(clientId);
  if (!strategy || strategy.learnings.length === 0) return null;
  return <LearnedPanel clientId={clientId} learnings={strategy.learnings} />;
}
