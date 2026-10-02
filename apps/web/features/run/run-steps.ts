import { researchStepIdSchema, type ResearchStepId } from "@social-agent/shared";
import type { ResearchView, Strategy } from "@/lib/types";

/** One row in the five-step run list: a title and the detail shown under it. */
export interface RunStep {
  title: string;
  detail: string;
}

export interface Run {
  steps: RunStep[];
  /** 0-based index of the step in progress. */
  currentIndex: number;
  minutesLeft: number;
}

const RESEARCH_STEPS = researchStepIdSchema.options;

/**
 * Title and detail for the four research steps, then the fifth step that writes the plan once
 * research is done. The detail wording matches `STEP_LABEL` in
 * `features/strategy/research-running-banner.tsx` (a separate, already-approved re-run screen
 * that stays untouched, so its wording is repeated here rather than imported).
 */
const STEP_COPY: Record<ResearchStepId | "writingPlan", RunStep> = {
  gather: { title: "Reading your website", detail: "Reading your site and reviews" },
  diagnose: { title: "Reading your market", detail: "Finding what holds sales back" },
  profile: { title: "Who your customers are", detail: "Profiling your best customers" },
  save: { title: "Saving your research", detail: "Saving your research" },
  writingPlan: { title: "Writing your plan", detail: "Themes, how often to post and the best times" },
};

const RUN_STEPS: RunStep[] = [...RESEARCH_STEPS.map((id) => STEP_COPY[id]), STEP_COPY.writingPlan];

/**
 * Derives the run from what exists, since no "strategy generating" flag is stored anywhere:
 * a strategy means the run is over, a failed research is the existing failed banner's problem
 * (not this one), and anything else in progress — including no research record yet — is the
 * first four steps. Research done with no strategy yet is the fifth step, writing the plan.
 */
export function deriveRun(research: ResearchView | null, strategy: Strategy | null): Run | null {
  if (strategy) return null;
  if (research?.status === "failed") return null;
  if (research?.status === "done") return runAt(RUN_STEPS.length - 1);

  const step = research?.currentStep ?? RESEARCH_STEPS[0]!;
  return runAt(RESEARCH_STEPS.indexOf(step));
}

/** Same remaining-steps-to-minutes rule as `ResearchRunningBanner`: one minute per step left. */
function runAt(currentIndex: number): Run {
  return { steps: RUN_STEPS, currentIndex, minutesLeft: RUN_STEPS.length - currentIndex };
}
