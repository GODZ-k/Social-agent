import Link from "next/link";
import { Clock } from "lucide-react";
import type { Brand, OnboardingStep } from "@/lib/types";
import { getOnboarding, getQuestionnaire } from "@/lib/api/server";
import { cn, prettyUrl } from "@/lib/utils";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";

const STEPS = ["Read your website", "Check your brand kit", "Get your first month"] as const;
const CURRENT = STEPS.length - 1;
const CURRENT_LABEL = STEPS[CURRENT];

/**
 * By the time a brand's record exists, the scan and the brand-kit review are already done, so
 * setup always shows step 3 of 3. Only the detail line under it varies with real progress.
 */
async function setupDetail(brandId: string, step: OnboardingStep): Promise<string> {
  if (step === "connect") return "Connect your accounts to keep going.";
  if (step === "research") return "The agent is researching your market.";
  if (step === "done") return "Your first month is almost ready.";
  const questionnaire = await getQuestionnaire(brandId);
  const session = questionnaire?.session;
  if (!session) return "A few quick questions, about 5 minutes.";
  const total = session.questions.length + session.followUps.length;
  return `${questionnaire.summary.length} of ${total} questions answered`;
}

/** BA-1: a brand still being set up. No loop yet, just the onboarding step it stopped at. */
export async function BrandSetupTile({ brand }: { brand: Brand }) {
  const onboarding = await getOnboarding(brand.id);
  if (!onboarding) return null;
  const detail = await setupDetail(brand.id, onboarding.step);
  const headingId = `brand-setup-${brand.id}`;

  return (
    <article className="grid gap-4 rounded-2xl bg-card p-5 shadow-none ring-1 ring-border md:p-6" aria-labelledby={headingId}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <span
            aria-hidden
            className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary font-display text-lg font-semibold text-muted-foreground"
          >
            {brand.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <h2 id={headingId} className="truncate font-display text-[1.1875rem] font-semibold tracking-tight">
              {brand.name}
            </h2>
            <p className="type-label truncate">{prettyUrl(brand.url)}</p>
          </div>
        </div>
        <Badge variant="tint">
          <Clock className="size-3" />
          Setting up
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2" aria-label={`Setup, step 3 of 3: ${CURRENT_LABEL}`}>
        {STEPS.map((label, i) => (
          <div key={label}>
            <div className={cn("h-1.5 rounded-full", i < CURRENT ? "bg-primary/45" : "bg-primary")} />
            <p className={cn("mt-2 hidden text-xs sm:block", i === CURRENT ? "font-medium text-foreground" : "text-muted-foreground")}>
              {label}
            </p>
          </div>
        ))}
      </div>
      <p className="type-label sm:hidden">
        Step 3 of 3: <b className="font-medium text-foreground">{CURRENT_LABEL}</b>
      </p>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4 text-sm">
        <div>
          <p className="font-medium">{detail}</p>
          <p className="type-label mt-0.5">The agent plans your first month from your answers. Pick up where you left off.</p>
        </div>
        <Button asChild className="max-[560px]:w-full">
          <Link href={`/onboarding?brandId=${brand.id}`}>Continue setup</Link>
        </Button>
      </div>
    </article>
  );
}
