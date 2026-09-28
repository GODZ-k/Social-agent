"use client";

import { useEffect, useState } from "react";
import { readResearch } from "@/lib/api/actions";
import type { Client, OnboardingState, OnboardingStep, QuestionnaireView, ResearchView, SocialAccountRow } from "@/lib/types";
import { SkeletonRows } from "@repo/ui/components/states";
import { OnboardingSteps } from "@/features/onboarding/onboarding-steps";
import { ConnectAccounts } from "@/features/onboarding/connect-accounts";
import { AdminConnectAccounts } from "@/features/onboarding/admin-connect-accounts";
import { OnboardingBrandKitEdit } from "@/features/onboarding/onboarding-brand-kit-edit";
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
  accounts,
  personName,
}: {
  client: Client;
  onboarding: OnboardingState;
  questionnaire: QuestionnaireView | null;
  research: ResearchView | null;
  accounts: SocialAccountRow[];
  /** Set when an admin is building this brand for a client; changes the connect step. */
  personName: string | null;
}) {
  const [step, setStep] = useState(onboarding.step);
  const [researchView, setResearchView] = useState(research);
  // Local, like `researchView`, so a rescan's server-side reset (`rescanBrandKit`) can clear what
  // this component shows without waiting on a full page reload to re-fetch the prop.
  const [questionnaireView, setQuestionnaireView] = useState(questionnaire);
  // Also local: a rescan clears the client's connections server-side too (so connect isn't
  // skipped on a leftover "already connected" flag), and `ConnectAccounts` reads them from here.
  const [liveClient, setLiveClient] = useState(client);
  // Where "Change your connections" was clicked from, so its own "Continue" returns there
  // instead of always forcing the questionnaire — null on the ordinary forward path.
  const [returnStep, setReturnStep] = useState<OnboardingStep | null>(null);
  // An overlay, not a step: the brand kit isn't part of this component's own step state (it's
  // saved before OnboardingJourney ever mounts), so "editing it" doesn't change `step` underneath.
  const [editingKit, setEditingKit] = useState(false);
  const basePath = personName ? "/admin/c" : "/c";

  function openConnect() {
    setReturnStep(step);
    setStep("connect");
  }

  function continueFromConnect() {
    setStep(returnStep ?? "questionnaire");
    setReturnStep(null);
  }

  // A rescan is treated as a genuine first scan: the kit is replaced outright, and connect, the
  // questionnaire and research all restart, so nothing here skips ahead on state from the earlier
  // pass. Saving it is also how this overlay closes now: there's no Previous, only through.
  function handleKitReset(freshClient: Client) {
    setLiveClient(freshClient);
    setQuestionnaireView(null);
    setResearchView(null);
    setReturnStep(null);
    setStep("connect");
    setEditingKit(false);
  }

  const polling = step === "research" && (researchView?.status === "queued" || researchView?.status === "running");
  useEffect(() => {
    if (!polling) return;
    let cancelled = false;
    const timer = setInterval(async () => {
      const read = await readResearch(liveClient.id);
      if (cancelled || !read.ok) return;
      setResearchView(read.data);
      if (read.data.status === "done") setStep("done");
    }, 1500);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [polling, liveClient.id]);

  return (
    <>
      {/* The chat fills the phone screen on its own; a step bar above it would push the account manager's first message off-screen. */}
      <div className={step === "questionnaire" ? "max-[560px]:hidden" : undefined}>
        <OnboardingSteps current={STEP_NUMBER[step]} />
      </div>

      {/* A mistake shouldn't mean starting over: connect and the questionnaire each carry their own
          single Back button, straight to the step before them. Research and done have no such
          step of their own to attach one to, so they keep this text link back to connect instead. */}
      {!editingKit && step !== "connect" && step !== "questionnaire" && (
        <div className="mx-auto mb-8 -mt-2 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
          <button type="button" className="type-label underline underline-offset-2 hover:text-foreground" onClick={openConnect}>
            Change your connections
          </button>
        </div>
      )}

      {editingKit ? (
        <OnboardingBrandKitEdit client={liveClient} accounts={accounts} onReset={handleKitReset} />
      ) : (
        <>
          {step === "connect" &&
            (personName ? (
              <AdminConnectAccounts
                clientId={liveClient.id}
                personName={personName}
                platforms={liveClient.platforms}
                initialAccounts={liveClient.accounts}
                onContinue={continueFromConnect}
                onBack={() => setEditingKit(true)}
              />
            ) : (
              <ConnectAccounts
                clientId={liveClient.id}
                platforms={liveClient.platforms}
                initialAccounts={liveClient.accounts}
                onContinue={continueFromConnect}
                onBack={() => setEditingKit(true)}
              />
            ))}

          {step === "questionnaire" && (
            <QuestionnaireChat
              clientId={liveClient.id}
              initial={questionnaireView}
              onApproved={(next) => {
                setResearchView(next);
                setStep("research");
              }}
              onBack={openConnect}
            />
          )}

          {step === "research" &&
            (!researchView ? (
              <SkeletonRows rows={3} className="mx-auto max-w-3xl" />
            ) : researchView.status === "failed" ? (
              <ResearchFailed clientId={liveClient.id} onRetried={setResearchView} basePath={basePath} />
            ) : (
              <ResearchRunning name={liveClient.name} research={researchView} />
            ))}

          {step === "done" && researchView && <ResearchDone clientId={liveClient.id} research={researchView} basePath={basePath} />}
        </>
      )}
    </>
  );
}
