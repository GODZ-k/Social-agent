import { Clock, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DraftingSlot } from "@/modules/content/types";

/** FL-4: the live step of a drafting slot, a clock while it waits its turn, a spinner once started. */
export function DraftingStep({ step, className }: { step: DraftingSlot["step"]; className?: string }) {
  const waiting = step === "Next in line";
  return (
    <span className={cn("flex items-center gap-1.5 text-xs", waiting ? "text-muted-foreground" : "text-tint-foreground", className)}>
      {waiting ? <Clock className="size-3" /> : <LoaderCircle className="size-3 animate-spin" />}
      {step}
    </span>
  );
}
