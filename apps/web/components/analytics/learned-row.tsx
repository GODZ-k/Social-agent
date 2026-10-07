import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { Learning } from "@/lib/types";
import { cn } from "@/lib/utils";

const IMPACT_ICON = { up: TrendingUp, down: TrendingDown, neutral: Minus } as const;

const IMPACT_TONE: Record<Learning["impact"], string> = {
  up: "bg-success/12 text-success",
  down: "bg-destructive/12 text-destructive",
  neutral: "bg-secondary text-muted-foreground",
};

export function LearnedRow({ learning }: { learning: Learning }) {
  const Icon = IMPACT_ICON[learning.impact];
  return (
    <li className="grid gap-3 border-t border-border py-4 first:border-0 first:pt-1 sm:grid-cols-[2rem_minmax(0,1fr)_minmax(0,17rem)] sm:items-start">
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", IMPACT_TONE[learning.impact])}>
        <Icon className="size-3.5" strokeWidth={2.4} />
      </span>
      <div>
        <p className="font-medium">{learning.insight}</p>
        <p className="type-label mt-1">{learning.evidence}</p>
      </div>
      <div className={cn("rounded-xl p-3 text-[0.8125rem] leading-snug", learning.change ? "bg-tint text-tint-foreground" : "bg-secondary text-muted-foreground")}>
        <span className="mb-0.5 block text-[0.75rem] font-semibold">What changes</span>
        {learning.change ?? "Nothing yet. Kept for another month."}
      </div>
    </li>
  );
}
