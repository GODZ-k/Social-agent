"use client";

import { ArrowRight, Check } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { cn } from "@/lib/utils";

/** The right-column gate: what FL-1 still needs before Continue wakes up. */
export function NeededChecklist({ items, allDone }: { items: { label: string; done: boolean }[]; allDone: boolean }) {
  return (
    <div className="mt-5">
      <p aria-label="Needed to continue" className="font-semibold">
        Needed to continue
      </p>
      <ul className="mt-2 grid gap-1.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            <span className={cn("grid size-4 shrink-0 place-items-center rounded-full", item.done ? "bg-success text-white" : "ring-1 ring-border")}>
              {item.done && <Check className="size-2.5" strokeWidth={3} />}
            </span>
            <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
          </li>
        ))}
      </ul>
      <Button type="submit" size="lg" className="mt-4 w-full" disabled={!allDone}>
        Continue
        <ArrowRight aria-hidden />
      </Button>
      <p className="type-label mt-2.5 text-center">You can change all of this later in Settings.</p>
    </div>
  );
}
