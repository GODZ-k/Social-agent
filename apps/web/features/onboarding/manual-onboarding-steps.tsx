import { Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Website skipped", "Fill in your brand kit", "Get your first month"] as const;

/** The onboarding step bar for the manual FL-1 path: step 1 reads as skipped, not done, since no site was read. */
export function ManualOnboardingSteps() {
  return (
    <nav aria-label="Onboarding steps" className="mx-auto mb-8 flex max-w-3xl items-center justify-center gap-2 sm:gap-3">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const skipped = step === 1;
        const on = step === 2;
        return (
          <div key={label} className="flex min-w-0 items-center gap-2 sm:gap-3">
            {i > 0 && <span className="h-px w-4 shrink-0 bg-border sm:w-8" aria-hidden />}
            <span className="flex min-w-0 items-center gap-2">
              <span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium", markerTone(skipped, on))}>
                {skipped ? <Minus className="size-3.5" strokeWidth={3} /> : step}
              </span>
              <span className={cn("truncate text-sm font-medium", on ? "text-foreground" : "text-muted-foreground", !on && "hidden sm:inline")}>
                {label}
              </span>
            </span>
          </div>
        );
      })}
    </nav>
  );
}

function markerTone(skipped: boolean, on: boolean): string {
  if (skipped) return "bg-card text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]";
  if (on) return "bg-primary text-primary-foreground";
  return "bg-secondary text-muted-foreground";
}
