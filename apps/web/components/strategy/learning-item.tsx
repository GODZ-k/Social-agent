import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { Learning } from "@/lib/types";
import { cn } from "@/lib/utils";

const IMPACT_ICON = { up: TrendingUp, down: TrendingDown, neutral: Minus } as const;

const IMPACT_TONE: Record<Learning["impact"], string> = {
  up: "bg-success/12 text-success",
  down: "bg-destructive/12 text-destructive",
  neutral: "bg-secondary text-muted-foreground",
};

export function LearningItem({ learning }: { learning: Learning }) {
  const Icon = IMPACT_ICON[learning.impact];
  return (
    <li className="flex gap-3.5">
      <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-full", IMPACT_TONE[learning.impact])}>
        <Icon className="size-3.5" strokeWidth={2.4} />
      </span>
      <div>
        <p className="font-medium">{learning.insight}</p>
        <p className="type-label mt-0.5">{learning.evidence}</p>
      </div>
    </li>
  );
}
