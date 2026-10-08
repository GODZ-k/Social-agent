import { Sparkles } from "lucide-react";
import type { Strategy } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { LearningItem } from "./learning-item";

/** FL-5, strategy version 2+: what changed since the version before it, and why, from the
 * same learnings the agent used to redraft. Only shown for a redraft (`version > 1`); a
 * first draft has no "before" to compare against, so S20a/b/c render unchanged. */
export function VersionChangesPanel({ strategy }: { strategy: Strategy }) {
  if (strategy.version <= 1) return null;

  const note =
    strategy.changeNote ??
    "Your results since the last version changed what the agent leads with; everything else stays the same.";

  return (
    <Panel aria-labelledby="version-changes-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="version-changes-heading" className="type-heading">
          What changed and why
        </h2>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary px-3.5 py-1.5 text-[0.8125rem] text-muted-foreground">
          Version {strategy.version - 1} to {strategy.version}
        </span>
      </div>
      <div className="mt-4 flex items-start gap-3.5 rounded-xl bg-secondary p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint text-tint-foreground">
          <Sparkles className="size-4" />
        </span>
        <div>
          <p className="type-label">The strategist&rsquo;s note</p>
          <p className="mt-0.5 italic">&ldquo;{note}&rdquo;</p>
        </div>
      </div>
      {strategy.learnings.length > 0 && (
        <>
          <p className="type-label mt-5 mb-3">The learnings behind it</p>
          <ul className="grid gap-x-8 gap-y-5 md:grid-cols-2">
            {strategy.learnings.map((learning) => (
              <LearningItem key={learning.id} learning={learning} />
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}
