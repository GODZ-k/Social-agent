import { formatDistanceToNow } from "date-fns";
import type { Strategy } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { Badge } from "@repo/ui/components/badge";

export function GoalPanel({ strategy }: { strategy: Strategy }) {
  return (
    <Panel className="bg-tint shadow-none">
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <Badge variant="tint" className="bg-tint-strong">Version {strategy.version}</Badge>
        <span className="type-label">
          Written {formatDistanceToNow(new Date(strategy.generatedAt), { addSuffix: true })}
        </span>
      </div>
      <p className="max-w-[40ch] font-display text-[1.375rem] leading-[1.2] font-semibold tracking-[-0.02em] text-tint-foreground md:text-[1.75rem]">
        {strategy.goal}
      </p>
    </Panel>
  );
}
