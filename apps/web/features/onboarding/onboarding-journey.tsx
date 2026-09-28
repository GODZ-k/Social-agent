"use client";

import { useEffect, useState } from "react";
import { readResearch } from "@/lib/api/actions";
import type { Client, OnboardingState, OnboardingStep, QuestionnaireView, ResearchView } from "@/lib/types";
import { SkeletonRows } from "@repo/ui/components/states";
import { OnboardingSteps } from "@/features/onboarding/onboarding-steps";
import { ConnectAccounts } from "@/features/onboarding/connect-accounts";
import { AdminConnectAccounts } from "@/features/onboarding/admin-connect-accounts";
import { QuestionnaireChat } from "@/features/questionnaire/questionnaire-chat";
import { ResearchRunning } from "@/features/research/research-running";
import { ResearchFailed } from "@/features/research/research-failed";
import { ResearchDone } from "@/features/research/research-done";

const STEP_NUMBER: Record<OnboardingStep, 2 | 3> = { brand_kit: 2, connect: 2, questionnaire: 3, research: 3, done: 3 };

/** Everything after the brand kit is saved: connect, the questionnaire, then research (S17b/c, S18, S19). */
export function OnboardingJourney({
  client,
  onboarding,
  questionnaire,
  research,
  personName,
}: {
  client: Client;
  onboarding: OnboardingState;
  questionnaire: QuestionnaireView | null;
  research: ResearchView | null;
  /** Set when an admin is building this brand for a client; changes the connect step. */
  personName: string | null;
}) {
  const [step, setStep] = useState(onboarding.step);
  const [researchView, setResearchView] = useState(research);
  const basePath = personName ? "/admin/c" : "/c";

  const polling = step === "research" && (researchView?.status === "queued" || researchView?.status === "running");
  useEffect(() => {
    if (!polling) return;
    let cancelled = false;
    const timer = setInterval(async () => {
      const read = await readResearch(client.id);
      if (cancelled || !read.ok) return;
      setResearchView(read.data);
      if (read.data.status === "done") setStep("done");
    }, 1500);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [polling, client.id]);

  return (
    <>
      {/* The chat fills the phone screen on its own; a step bar above it would push the account manager's first message off-screen. */}
      <div className={step === "questionnaire" ? "max-[560px]:hidden" : undefined}>
        <OnboardingSteps current={STEP_NUMBER[step]} />
      </div>

      {step === "connect" &&
        (personName ? (
          <AdminConnectAccounts
            clientId={client.id}
            personName={personName}
            platforms={client.platforms}
            initialAccounts={client.accounts}
            onContinue={() => setStep("questionnaire")}
          />
        ) : (
          <ConnectAccounts
            clientId={client.id}
            platforms={client.platforms}
            initialAccounts={client.accounts}
            onContinue={() => setStep("questionnaire")}
          />
        ))}

      {step === "questionnaire" && (
        <QuestionnaireChat
          clientId={client.id}
          initial={questionnaire}
          onApproved={(next) => {
            setResearchView(next);
            setStep("research");
          }}
        />
      )}

      {step === "research" &&
        (!researchView ? (
          <SkeletonRows rows={3} className="mx-auto max-w-3xl" />
        ) : researchView.status === "failed" ? (
          <ResearchFailed clientId={client.id} onRetried={setResearchView} basePath={basePath} />
        ) : (
          <ResearchRunning name={client.name} research={researchView} />
        ))}

      {step === "done" && researchView && <ResearchDone clientId={client.id} research={researchView} basePath={basePath} />}
    </>
  );
}
