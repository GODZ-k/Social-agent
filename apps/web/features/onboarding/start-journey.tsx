import { Calendar, Clock, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Read your website", detail: "Pages, colours, typefaces and how you write.", meta: "About a minute", icon: Clock },
  { label: "Check your brand kit", detail: "Fix anything that sounds wrong. Posts start from it.", meta: "About 3 minutes", icon: Pencil },
  { label: "Get your first month", detail: "Themes, how often to post and the best times.", meta: "Ready to approve", icon: Calendar },
] as const;

/** What happens next, shown once on the first onboarding screen (S01) before anything has started. */
export function StartJourney() {
  return (
    <div aria-label="What happens next" className="relative mx-auto mt-14 max-w-[34rem] text-left min-[901px]:max-w-[60rem]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[16.6%] top-9 hidden h-px bg-border min-[901px]:block"
      />
      {/* Same idea rotated for the stacked layout: a thread through the numbered circles, hidden by the cards except in the gaps. */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[2.125rem] w-px bg-border min-[901px]:hidden" />
      <div className="grid grid-cols-1 gap-3 min-[901px]:grid-cols-3 min-[901px]:gap-4">
        {STEPS.map((step, i) => (
          <div
            key={step.label}
            className={cn(
              "relative grid grid-cols-[2.5rem_1fr] items-start gap-x-3 rounded-[1.375rem] p-5 min-[901px]:block min-[901px]:p-5.5",
              i === 0 ? "bg-tint" : "bg-card shadow-raised",
            )}
          >
            <div
              className={cn(
                "row-span-3 grid size-7 place-items-center rounded-full text-[0.8125rem] font-semibold min-[901px]:row-span-1 min-[901px]:mb-4",
                i === 0 ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]",
              )}
            >
              {i + 1}
            </div>
            <p className="font-semibold">{step.label}</p>
            <p className="type-label mt-1">{step.detail}</p>
            <p className="type-label mt-3.5 flex items-center gap-1.5">
              <step.icon className="size-3.5" />
              {step.meta}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
