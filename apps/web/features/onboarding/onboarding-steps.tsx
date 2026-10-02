import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Read your website", "Check your brand kit", "Get your first week"] as const;

/** The onboarding step bar: shown on every onboarding screen. On phone only the current step keeps its label. */
export function OnboardingSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Onboarding steps" className="mx-auto mb-8 flex max-w-3xl items-center justify-center gap-2 sm:gap-3">
      {STEPS.map((label, i) => {
        const step = (i + 1) as 1 | 2 | 3;
        const done = step < current;
        const on = step === current;
        return (
          <div key={label} className="flex min-w-0 items-center gap-2 sm:gap-3">
            {i > 0 && <span className="h-px w-4 shrink-0 bg-border sm:w-8" aria-hidden />}
            <span className="flex min-w-0 items-center gap-2">
              <span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium", markerTone(done, on))}>
                {done ? <Check className="size-3.5" strokeWidth={3} /> : step}
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

function markerTone(done: boolean, on: boolean): string {
  if (done) return "bg-card text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]";
  if (on) return "bg-primary text-primary-foreground";
  return "bg-secondary text-muted-foreground";
}
