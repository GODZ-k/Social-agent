import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { Button } from "@repo/ui/components/button";

/** ST-5: the visible month has no posts. Sits above the grid, which still shows the strategy's free best times. */
export function EmptyMonthNote({ monthLabel, freeCount, contentHref }: { monthLabel: string; freeCount: number; contentHref: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl bg-tint p-4">
      <div className="min-w-0">
        <h3 className="type-heading text-tint-foreground">Nothing planned in {monthLabel} yet</h3>
        <p className="mt-1 max-w-[56ch] text-sm text-tint-foreground/80">
          {freeCount > 0
            ? "The dashed slots are your strategy's best times. The agent fills them with drafts about a week ahead, and each one waits for your approval."
            : "Once your strategy has best times, the agent fills them with drafts about a week ahead. Each one waits for your approval."}
        </p>
      </div>
      <Button size="sm" asChild>
        <Link href={contentHref}>
          <LayoutGrid /> Open content
        </Link>
      </Button>
    </div>
  );
}
