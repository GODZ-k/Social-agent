import type { Learning } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { LearningItem } from "@/features/strategy/learning-item";
import { RegenerateStrategyButton } from "@/features/strategy/regenerate-button";

export function LearnedPanel({ clientId, learnings }: { clientId: string; learnings: Learning[] }) {
  return (
    <Panel aria-labelledby="learned-heading" className="bg-tint shadow-none">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="learned-heading" className="type-heading text-tint-foreground">What the agent learned</h2>
          <p className="mt-1 text-tint-foreground/80">These findings go into the next version of the strategy.</p>
        </div>
        <RegenerateStrategyButton clientId={clientId} variant="default" idleLabel="Rewrite the strategy" busyLabel="Rewriting the strategy" />
      </div>
      <ul className="grid gap-x-8 gap-y-5 md:grid-cols-2">
        {learnings.map((l) => <LearningItem key={l.id} learning={l} />)}
      </ul>
    </Panel>
  );
}
