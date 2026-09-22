import Link from "next/link";
import type { Learning } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { LearningItem } from "./learning-item";

export function LearningsPanel({ clientId, learnings }: { clientId: string; learnings: Learning[] }) {
  return (
    <Panel aria-labelledby="learnings-heading">
      <h2 id="learnings-heading" className="type-heading">What the agent has learned</h2>
      <p className="type-label mt-1 mb-5">Findings from published posts. Each one shaped this version of the strategy.</p>
      {learnings.length === 0 ? (
        <p className="text-muted-foreground">
          Nothing yet. Findings appear here once the first posts have been live for a week.{" "}
          <Link href={`/c/${clientId}/content`} className="font-medium text-tint-foreground hover:underline">
            Draft the first posts
          </Link>
        </p>
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
