import { LoaderCircle } from "lucide-react";
import { researchStepIdSchema, type ResearchStepId } from "@social-agent/shared";
import { Panel } from "@repo/ui/components/states";

const STEPS = researchStepIdSchema.options;

const STEP_LABEL: Record<ResearchStepId, string> = {
  gather: "reading your site and reviews",
  diagnose: "finding what holds sales back",
  profile: "profiling your best customers",
  save: "saving your research",
};

/** S21b: a re-run in progress. The version below stays readable until this one is saved. */
export function ResearchRunningBanner({ currentStep, visibleVersion }: { currentStep: ResearchStepId | null; visibleVersion: number }) {
  const step = currentStep ?? STEPS[0]!;
  const index = STEPS.indexOf(step);
  const remaining = STEPS.length - index;
  const percent = Math.round(((index + 0.5) / STEPS.length) * 100);

  return (
    <Panel className="mb-5 flex items-center gap-4" aria-live="polite">
      <LoaderCircle className="size-8 shrink-0 animate-spin text-primary" />
      <div className="min-w-0 flex-1">
        <h2 className="type-heading">Researching again: {STEP_LABEL[step]}</h2>
        <p className="type-label mt-1">
          Step {index + 1} of {STEPS.length}, about {remaining} minute{remaining === 1 ? "" : "s"} left. Below is
          version {visibleVersion} until the new one is ready. Your strategy keeps running; the strategist uses the
          new research at its next update.
        </p>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Research progress"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </Panel>
  );
}
