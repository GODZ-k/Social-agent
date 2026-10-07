"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Lock } from "lucide-react";
import { spring } from "@repo/ui/lib/motion";
import { UrlForm } from "@/components/onboarding/url-form";
import { StartJourney } from "@/components/onboarding/start-journey";
import { OnboardingSteps } from "@/components/onboarding/onboarding-steps";
import { ScanProgress } from "@/components/onboarding/scan-progress";
import { ScanFailed } from "@/components/onboarding/scan-failed";
import { useScan } from "@/hooks/use-scan";
import { OnboardingBrandKitForm } from "@/components/brand-kit/onboarding-brand-kit-form";

type Step = "url" | "scanning" | "error" | "review";

export function OnboardingFlow({ initialUrl, personId }: { initialUrl: string | null; personId?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const scan = useScan(url, personId);
  const step = stepFor(url, scan.status);

  return (
    <>
      {/* The step cards on this first screen already show where onboarding goes; a stepper above them would repeat the same three steps. */}
      {step !== "url" && <OnboardingSteps current={step === "review" ? 2 : 1} />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          // Materialise rather than slide: the steps replace each other in place.
          initial={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
          transition={spring.smooth}
        >
          {step === "url" && (
            <div className="text-center">
              <div className="mx-auto max-w-[46rem]">
                {/* Smaller than type-display's clamp, which was built for wider dashboard headings and wrapped this line at phone width. */}
                <h1 className="font-display font-semibold leading-[1.05] tracking-tight [font-size:clamp(1.75rem,1.1rem+2.5vw,3rem)]">
                  Start with your website
                </h1>
                <p className="mx-auto mt-3.5 max-w-xl text-muted-foreground">
                  Paste your address. The agent reads it and drafts your brand kit, so your first posts sound like you.
                </p>
                <div className="mx-auto mt-8 max-w-xl text-left">
                  <UrlForm onSubmit={setUrl} autoFocus placeholder="yourbusiness.com" submitLabel="Read my website" />
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.8125rem] text-muted-foreground max-[560px]:justify-start">
                    <Lock aria-hidden className="size-3.5 shrink-0" />
                    Only public pages are read. Nothing is posted anywhere.
                  </p>
                </div>
              </div>
              {/* Outside the 46rem text column above so it can reach its own, wider max-width at desktop. */}
              <StartJourney />
              <p className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 aria-hidden className="size-4 text-success" />
                Nothing is published until you approve it.
              </p>
            </div>
          )}

          {step === "scanning" && url && <ScanProgress url={url} activeIndex={scan.step} preview={scan.preview} onChangeAddress={() => setUrl(null)} />}

          {step === "error" && scan.error && <ScanFailed url={url ?? ""} onRetry={scan.restart} onChangeAddress={() => setUrl(null)} />}

          {step === "review" && url && scan.result && <OnboardingBrandKitForm url={url} scan={scan.result} personId={personId} />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function stepFor(url: string | null, status: ReturnType<typeof useScan>["status"]): Step {
  if (!url) return "url";
  if (status === "done") return "review";
  if (status === "error") return "error";
  return "scanning";
}
