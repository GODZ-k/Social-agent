import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { Learning } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LearningItem({ learning }: { learning: Learning }) {
  const Icon = learning.impact === "up" ? TrendingUp : learning.impact === "down" ? TrendingDown : Minus;
  return (
    <li className="flex gap-3.5">
      <span
        className={cn(
          "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full",
          learning.impact === "up" ? "bg-success/12 text-success" : learning.impact === "down" ? "bg-destructive/12 text-destructive" : "bg-secondary text-muted-foreground",
        )}
      >
        <Icon className="size-3.5" strokeWidth={2.4} />
      </span>
      <div>
        <p className="font-medium">{learning.insight}</p>
        <p className="type-label mt-0.5">{learning.evidence}</p>
      </div>
    </li>
  );
}
