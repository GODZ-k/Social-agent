import { formatDistanceToNow, parseISO } from "date-fns";
import { Sparkles } from "lucide-react";
import type { Strategy } from "@/lib/types";
import { Badge } from "@repo/ui/components/badge";

/**
 * ST-5: the strategy just started and the agent hasn't produced a post yet — different from
 * FL-4's `DraftingSummaryPanel`, which tracks a batch the owner asked for by hand. This is what
 * shows before the owner has clicked anything.
 */
export function StrategyDraftingNotice({ strategy }: { strategy: Strategy }) {
  const startedAt = parseISO(strategy.activatedAt ?? strategy.generatedAt);

  return (
    <div className="mx-auto max-w-md text-center" role="status">
      <p className="type-heading">The agent is drafting your first posts</p>
      <p className="mt-2.5 text-muted-foreground">
        It&rsquo;s writing from your strategy&rsquo;s themes and best times. This takes a few minutes; you can leave this page.
      </p>
      <Badge variant="tint" className="mt-4">
        <Sparkles />
        Started {formatDistanceToNow(startedAt, { addSuffix: true })}
      </Badge>
      <p className="mt-4 text-xs text-muted-foreground">When they&rsquo;re ready they show up here and in Approvals. Nothing goes out without you.</p>
    </div>
  );
}
