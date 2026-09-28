import { Check, Clock, TriangleAlert, Target, Users, Globe } from "lucide-react";
import type { ResearchStepId } from "@social-agent/shared";
import type { ResearchView } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { cn } from "@/lib/utils";

const STEPS: { id: ResearchStepId; label: string; detail: string }[] = [
  { id: "gather", label: "Reading about your market", detail: "Your website, your answers, reviews and similar brands" },
  { id: "diagnose", label: "Finding what holds sales back", detail: "Comparing what customers say with what the website offers" },
  { id: "profile", label: "Getting to know your best customers", detail: "Who they are, what they want, the words they use" },
  { id: "save", label: "Writing it up", detail: "A short brief your strategy is built on" },
];

const EXPECT = [
  { icon: TriangleAlert, title: "What holds sales back", detail: "The one thing to fix first" },
  { icon: Target, title: "What your posts should do", detail: "One clear job for your social media" },
  { icon: Users, title: "Your best customers", detail: "2 to 4 groups, in their own words" },
  { icon: Globe, title: "Brands like yours", detail: "What works for them, and where you can win" },
] as const;

/** Business research in progress (S19a): four named steps, plus what the brief will hold once it's done. */
export function ResearchRunning({ name, research }: { name: string; research: ResearchView }) {
  const activeIndex = research.currentStep ? STEPS.findIndex((s) => s.id === research.currentStep) : 0;

  const activeStep = STEPS[Math.min(activeIndex, STEPS.length - 1)]!;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="type-label">Researching your market</p>
      <h1 className="type-title mt-1">{name}</h1>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel aria-live="polite">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="type-heading text-base">{activeStep.label}</h2>
            <span className="type-label shrink-0">{timeLeftLabel(activeIndex, STEPS.length)}</span>
          </div>

          <ol className="mt-3 grid gap-1">
            {STEPS.map((step, i) => {
              const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "waiting";
              return (
                <li key={step.id} className={cn("flex items-center gap-3.5 rounded-lg px-1 py-2.5", state === "waiting" && "opacity-40")}>
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full",
                      state === "done" ? "bg-primary text-primary-foreground" : state === "active" ? "bg-tint-strong" : "bg-secondary",
                    )}
                  >
                    {state === "done" && <Check className="size-3.5" strokeWidth={3} />}
                    {state === "active" && <span className="size-2 animate-pulse rounded-full bg-primary" />}
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block font-medium", state === "waiting" && "text-muted-foreground")}>{step.label}</span>
                    <span className="type-label block max-[560px]:hidden">{step.detail}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </Panel>

        <Panel className="max-[560px]:order-first">
          <h2 className="type-heading">What you&apos;ll get</h2>
          <p className="type-label mt-1">A short brief in plain words. Your first month of posts is planned from it.</p>
          <ul className="mt-4 grid gap-3">
            {EXPECT.map((item) => (
              <li key={item.title} className="flex items-start gap-3 border-t pt-3 first:border-t-0 first:pt-0">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                  <item.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{item.title}</p>
                  <p className="type-label">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <p className="type-label mt-5 flex items-start gap-3 rounded-2xl bg-tint px-4.5 py-4 text-tint-foreground">
        <Clock className="mt-0.5 size-3.5 shrink-0" />
        You can leave this page. Research keeps going, and your strategist starts on your first month as soon as it&apos;s done.
      </p>
    </div>
  );
}

/** Each step takes about a minute, so a step left is a minute left. */
function timeLeftLabel(activeIndex: number, total: number): string {
  const minutesLeft = total - activeIndex;
  if (minutesLeft <= 0) return "Almost done";
  if (minutesLeft === 1) return "About a minute left";
  return `About ${minutesLeft} minutes left`;
}
