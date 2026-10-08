import Link from "next/link";
import type { Learning } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { RegenerateStrategyButton } from "@/modules/strategy/components/regenerate-button";
import { LearnedRow } from "./learned-row";
import { routes, workspaceRoutes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

export function LearnedPanel({
  brandId,
  learnings,
  basePath = routes.brand.base,
}: {
  brandId: string;
  learnings: Learning[];
  basePath?: WorkspaceBase;
}) {
  return (
    <Panel id="learned" aria-labelledby="learned-heading">
      <h2 id="learned-heading" className="type-heading">
        What the agent learned
      </h2>
      <p className="type-label mt-0.5">From your own results. Each finding changes the strategy going forward.</p>
      <ul className="mt-3 grid">
        {learnings.map((learning) => (
          <LearnedRow key={learning.id} learning={learning} />
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="type-label">Posts you already approved stay as they are.</p>
        <div className="flex flex-wrap gap-2">
          <RegenerateStrategyButton brandId={brandId} variant="outline" idleLabel="Ask for changes" busyLabel="Asking" />
          <Button asChild>
            <Link href={workspaceRoutes(basePath).strategy(brandId)}>See the updated strategy</Link>
          </Button>
        </div>
      </div>
    </Panel>
  );
}
