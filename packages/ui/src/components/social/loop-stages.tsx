import type { LoopStage } from "./types";

/** The six stages of the agent loop, in order. Plain data, so server components can read it. */
export const LOOP: { stage: LoopStage; label: string; doing: string }[] = [
  { stage: "onboarding", label: "Onboard", doing: "Reading the website" },
  { stage: "strategy", label: "Strategy", doing: "Strategy ready to review" },
  { stage: "content", label: "Create", doing: "Drafting content" },
  { stage: "approval", label: "Approve", doing: "Waiting for your approval" },
  { stage: "publishing", label: "Publish", doing: "Publishing on schedule" },
  { stage: "learning", label: "Learn", doing: "Learning from results" },
];

export const stageInfo = (stage: LoopStage) => LOOP.find((s) => s.stage === stage) ?? LOOP[0]!;
