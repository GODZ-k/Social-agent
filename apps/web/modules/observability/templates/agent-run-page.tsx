import { notFound } from "next/navigation";
import { getAgentRun } from "@/lib/api/server";
import { RunHeader } from "@/modules/observability/components/run-header";
import { ProblemBanner } from "@/modules/observability/components/problem-banner";
import { RunStats } from "@/modules/observability/components/run-stats";
import { StepsWaterfall } from "@/modules/observability/components/steps-waterfall";
import { StepDetailPanel } from "@/modules/observability/components/step-detail-panel";
import { AboutRunPanel } from "@/modules/observability/components/about-run-panel";

export async function AgentRunPage({ params }: { params: Promise<{ runId: string }> }) {
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
