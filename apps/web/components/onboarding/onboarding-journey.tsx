"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Brand, OnboardingState, OnboardingStep, QuestionnaireView, SocialAccountRow } from "@/lib/types";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";
import { OnboardingSteps } from "@/components/onboarding/onboarding-steps";
import { AdminConnectAccounts, ConnectAccounts } from "@/components/onboarding/connect-accounts";
import { OnboardingBrandKitEdit } from "@/components/onboarding/onboarding-brand-kit-edit";
import { QuestionnaireChat } from "@/components/questionnaire/questionnaire-chat";

const STEP_NUMBER: Record<OnboardingStep, 2 | 3> = { brand_kit: 2, connect: 2, questionnaire: 3, done: 3 };

/**
 * Everything after the brand kit is saved: connect, then the questionnaire (S17b/c, S18).
 *
 * Onboarding ends when the Account Manager approves the questionnaire. Business discovery runs
 * for about five minutes after that, and the owner watches it from the brand's own workspace
 * rather than from here: nothing on this screen needs them, so holding them is time they could
 * spend in the product. The workspace shows the run, and `/strategy/research` keeps the findings.
 */
export function OnboardingJourney({
  brand,
  onboarding,
  questionnaire,
  accounts,
  personName,
}: {
  brand: Brand;
  onboarding: OnboardingState;
  questionnaire: QuestionnaireView | null;
  accounts: SocialAccountRow[];
  /** Set when an admin is building this brand for a client; changes the connect step. */
  personName: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(onboarding.step);
  // Local, so a rescan's server-side reset (`rescanBrandKit`) can clear what this component shows
  // without waiting on a full page reload to re-fetch the prop.
  const [questionnaireView, setQuestionnaireView] = useState(questionnaire);
  // Also local: a rescan clears the client's connections server-side too (so connect isn't
  // skipped on a leftover "already connected" flag), and `ConnectAccounts` reads them from here.
  const [liveBrand, setLiveBrand] = useState(brand);
  // Where "Change your connections" was clicked from, so its own "Continue" returns there
  // instead of always forcing the questionnaire — null on the ordinary forward path.
  const [returnStep, setReturnStep] = useState<OnboardingStep | null>(null);
  // An overlay, not a step: the brand kit isn't part of this component's own step state (it's
  // saved before OnboardingJourney ever mounts), so "editing it" doesn't change `step` underneath.
  const [editingKit, setEditingKit] = useState(false);
  const basePath: WorkspaceBasePath = personName ? "/admin/c" : "/c";

  function openConnect() {
    setReturnStep(step);
    setStep("connect");
  }

  function continueFromConnect() {
    setStep(returnStep ?? "questionnaire");
    setReturnStep(null);
  }

  // A rescan is treated as a genuine first scan: the kit is replaced outright, and connect and the
  // questionnaire both restart, so nothing here skips ahead on state from the earlier pass. Saving
  // it is also how this overlay closes now: there's no Previous, only through.
  function handleKitReset(freshBrand: Brand) {
    setLiveBrand(freshBrand);
    setQuestionnaireView(null);
    setReturnStep(null);
    setStep("connect");
    setEditingKit(false);
  }

  return (
    <>
      {/* The chat fills the phone screen on its own; a step bar above it would push the account manager's first message off-screen. */}
      <div className={step === "questionnaire" ? "max-[560px]:hidden" : undefined}>
        <OnboardingSteps current={STEP_NUMBER[step]} />
      </div>

      {/* A mistake shouldn't mean starting over: connect and the questionnaire each carry their own
          single Back button, straight to the step before them. */}
      {!editingKit && step !== "connect" && step !== "questionnaire" && (
        <div className="mx-auto mb-8 -mt-2 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
          <button type="button" className="type-label underline underline-offset-2 hover:text-foreground" onClick={openConnect}>
            Change your connections
          </button>
        </div>
      )}

      {editingKit ? (
        <OnboardingBrandKitEdit brand={liveBrand} accounts={accounts} onReset={handleKitReset} />
      ) : (
        <>
          {step === "connect" &&
            (personName ? (
              <AdminConnectAccounts
                brandId={liveBrand.id}
                personName={personName}
                platforms={liveBrand.platforms}
                initialAccounts={liveBrand.accounts}
                onContinue={continueFromConnect}
                onBack={() => setEditingKit(true)}
              />
            ) : (
              <ConnectAccounts
                brandId={liveBrand.id}
                platforms={liveBrand.platforms}
                initialAccounts={liveBrand.accounts}
                onContinue={continueFromConnect}
                onBack={() => setEditingKit(true)}
              />
            ))}

          {step === "questionnaire" && (
            <QuestionnaireChat
              brandId={liveBrand.id}
              initial={questionnaireView}
              onApproved={() => router.push(workspaceHref(basePath, liveBrand.id))}
              onBack={openConnect}
            />
          )}
        </>
      )}
    </>
  );
}
