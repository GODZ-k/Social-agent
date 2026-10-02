import { Check, Clock, LoaderCircle } from "lucide-react";
import { Panel } from "@repo/ui/components/states";
import { cn } from "@repo/ui/lib/utils";
import type { Run, RunStep } from "./run-steps";

type RowState = "done" | "now" | "later";

function rowState(index: number, currentIndex: number): RowState {
  if (index < currentIndex) return "done";
  if (index === currentIndex) return "now";
  return "later";
}

function RowDot({ state }: { state: RowState }) {
  if (state === "done") {
    return (
      <span className="grid size-6.5 shrink-0 place-items-center rounded-full bg-success/10 text-success">
        <Check className="size-3.5" />
      </span>
    );
  }
  if (state === "now") {
    return (
      <span className="grid size-6.5 shrink-0 place-items-center rounded-full bg-tint text-tint-foreground">
        <LoaderCircle className="size-3.5 animate-spin" />
      </span>
    );
  }
  return <span className="size-6.5 shrink-0 rounded-full bg-secondary" />;
}

function StepRow({ step, state }: { step: RunStep; state: RowState }) {
  return (
    <div className="flex items-start gap-3.5 border-b border-border py-3.5 last:border-0">
      <RowDot state={state} />
      <div className="min-w-0 flex-1">
        <p className={cn(state === "later" ? "text-muted-foreground" : "font-medium")}>{step.title}</p>
        <p className="type-label mt-0.5">{step.detail}</p>
      </div>
    </div>
  );
}

/**
 * The strategy page's full run list (rp2 researching, rp3 writing the plan): every step at once,
 * for whoever asked to watch it closely rather than wait on the overview's one-line hero.
 */
export function RunProgressPanel({ run }: { run: Run }) {
  const writingPlan = run.currentIndex === run.steps.length - 1;
  const lead = writingPlan ? "Writing your first week" : "Researching your business";
  const minuteWord = run.minutesLeft === 1 ? "minute" : "minutes";

  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <Panel aria-live="polite">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="type-heading text-base">{lead}</p>
          <span className="type-label">
            About {run.minutesLeft} {minuteWord} left
          </span>
        </div>
        <div className="mt-2">
          {run.steps.map((step, index) => (
            <StepRow key={step.title} step={step} state={rowState(index, run.currentIndex)} />
          ))}
        </div>
        <p className="mt-5 flex items-start gap-2 text-[0.8125rem] text-muted-foreground">
          <Clock className="mt-0.5 size-3.5 shrink-0" />
          <span>You can leave this page. It keeps going, and your plan is here when you come back.</span>
        </p>
      </Panel>
      <p className="type-label text-center">Nothing is published without you. This only plans what to post.</p>
    </div>
  );
}
