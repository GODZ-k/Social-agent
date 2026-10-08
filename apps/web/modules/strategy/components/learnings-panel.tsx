import { addDays, format } from "date-fns";
import { ArrowDown, ArrowUp, Sparkles } from "lucide-react";
import type { Learning } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Panel } from "@repo/ui/components/states";
import { Badge } from "@repo/ui/components/badge";
import { LearningItem } from "./learning-item";

const EXAMPLES = [
  { impact: "up" as const, insight: "Ingredient close-ups get 3 times more saves than product shots" },
  { impact: "down" as const, insight: "Posts after 8 PM reach half as many people" },
];

/** S20 "What the agent has learned": real findings, or an empty state that shows what one looks like. */
export function LearningsPanel({ learnings, postingStartsAt }: { learnings: Learning[]; postingStartsAt: string }) {
  const firstFindingsAt = format(addDays(new Date(postingStartsAt), 7), "d MMMM");

  return (
    <Panel aria-labelledby="learnings-heading">
      <h2 id="learnings-heading" className="type-heading">What the agent has learned</h2>
      <p className="type-label mt-1 mb-5">
        What worked and what didn&apos;t, from your own results. Each finding changes the next version of this plan.
      </p>
      {learnings.length === 0 ? (
        <div className="grid gap-5">
          <div className="flex items-start gap-3.5 rounded-xl bg-secondary p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint text-tint-foreground">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="font-medium">Nothing learned yet</p>
              <p className="type-label mt-0.5">
                Your first posts need about a week of results. First findings around {firstFindingsAt}; the agent
                then updates this plan and tells you what changed.
              </p>
            </div>
          </div>
          <div aria-label="What findings will look like">
            <p className="type-label mb-3">What findings will look like</p>
            <ul className="grid">
              {EXAMPLES.map((example) => (
                <li key={example.insight} className="flex items-center gap-3 border-t border-dashed border-border py-3 text-muted-foreground first:pt-0">
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full bg-secondary font-bold",
                      example.impact === "up" ? "text-success" : "text-destructive",
                    )}
                  >
                    {example.impact === "up" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1 text-[0.9375rem]">{example.insight}</span>
                  <Badge variant="neutral">Example</Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <ul className="grid gap-x-8 gap-y-5 md:grid-cols-2">
          {learnings.map((l) => (
            <LearningItem key={l.id} learning={l} />
          ))}
        </ul>
      )}
    </Panel>
  );
}
