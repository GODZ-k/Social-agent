import { notFound } from "next/navigation";
import { getAgentRun } from "@/lib/api/server";
import { RunHeader } from "@/features/observability/run-header";
import { ProblemBanner } from "@/features/observability/problem-banner";
import { RunStats } from "@/features/observability/run-stats";
import { StepsWaterfall } from "@/features/observability/steps-waterfall";
import { StepDetailPanel } from "@/features/observability/step-detail-panel";
import { AboutRunPanel } from "@/features/observability/about-run-panel";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AgentRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const run = await getAgentRun(runId);
  if (!run) notFound();

  const failedStep = run.steps.find((s) => s.status === "failed");

  return (
    <>
      <RunHeader run={run} />
      {run.problem && <ProblemBanner title={run.problem.title} advice={run.problem.advice} />}
      <RunStats run={run} />
      <div className="mt-5">
        <StepsWaterfall steps={run.steps} totalMs={run.durationMs} />
      </div>
      <div className={failedStep ? "mt-5 grid gap-5 lg:grid-cols-[2fr_1fr]" : "mt-5 grid gap-5 sm:grid-cols-2"}>
        {failedStep && <StepDetailPanel step={failedStep} />}
        <AboutRunPanel run={run} />
      </div>
    </>
  );
}
