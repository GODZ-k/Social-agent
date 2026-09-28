import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Check } from "lucide-react";
import type { Strategy } from "@/lib/types";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";

/** S20c: the draft has started, either the owner pressed "Start now" or it went on its own. */
export function StrategyStartedBanner({
  strategy,
  onAskForChanges,
  basePath = "/c",
}: {
  strategy: Strategy;
  onAskForChanges: () => void;
  basePath?: WorkspaceBasePath;
}) {
  const startedAt = strategy.activatedAt ? format(new Date(strategy.activatedAt), "h:mm a") : null;
  const onItsOwn = strategy.approvedBy === null;

  return (
    <Panel className="flex flex-wrap items-center gap-5 bg-success/10 shadow-none lg:flex-nowrap">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-success text-white">
        <Check className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="type-heading">
          {onItsOwn ? `Your strategy started${startedAt ? ` at ${startedAt}` : ""}` : "You started your strategy"}
        </h2>
        <p className="type-label mt-1">
          {onItsOwn
            ? "It started on its own after 30 minutes. The agent is drafting your first posts now; you approve each one before it goes out."
            : "The agent is drafting your first posts now; you approve each one before it goes out."}
        </p>
      </div>
      <div className="flex w-full gap-2.5 lg:w-auto">
        <Button variant="outline" className="flex-1 lg:flex-none" onClick={onAskForChanges}>
          Ask for changes
        </Button>
        <Button asChild className="flex-1 lg:flex-none">
          <Link href={workspaceHref(basePath, strategy.clientId, "/content")}>
            See the drafts
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </Panel>
  );
}
