import Link from "next/link";
import { LoaderCircle, Clock, ArrowRight } from "lucide-react";
import { StepMeter } from "@repo/ui/components/step-meter";
import { Button } from "@repo/ui/components/button";
import type { Run } from "./run-steps";
import { workspaceRoutes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

/**
 * The overview hero while business discovery, then the strategy, are being generated (rp1).
 * The heading holds still for the whole run; only the step line and the meter move.
 */
export function RunHero({ run, brandId, basePath }: { run: Run; brandId: string; basePath: WorkspaceBase }) {
  const step = run.steps[run.currentIndex]!;
  const minuteWord = run.minutesLeft === 1 ? "minute" : "minutes";

  return (
    <section className="grid gap-4.5 rounded-xl bg-tint p-5 md:p-6" aria-labelledby="run-heading">
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-card shadow-raised" aria-hidden="true">
          <LoaderCircle className="size-4.5 animate-spin text-primary" />
        </span>
        <div className="min-w-0 flex-1 basis-72">
          <h2 className="type-heading" id="run-heading">
            Getting your first week ready
          </h2>
          <p className="mt-1 text-tint-foreground/80">
            <b className="font-medium text-foreground">{step.detail}</b> &middot; about {run.minutesLeft}{" "}
            {minuteWord} left
          </p>
        </div>
        <Button asChild size="lg" className="max-[560px]:w-full">
          <Link href={workspaceRoutes(basePath).strategy(brandId)}>
            Watch it
            <ArrowRight />
          </Link>
        </Button>
      </div>
      <StepMeter total={run.steps.length} currentIndex={run.currentIndex} label={step.detail} />
      <p className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-muted-foreground">
        <Clock className="size-3.5 shrink-0 text-tint-foreground" />
        <span>You can leave this page. It keeps going, and your plan is here when you come back.</span>
        <span className="ml-auto font-medium whitespace-nowrap text-tint-foreground">
          Step {run.currentIndex + 1} of {run.steps.length}
        </span>
      </p>
    </section>
  );
}
