"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { spring } from "@repo/ui/lib/motion";
import { ErrorState } from "@repo/ui/components/states";
import { UrlForm } from "@/features/onboarding/url-form";
import { ScanProgress } from "@/features/onboarding/scan-progress";
import { useScan } from "@/features/onboarding/use-scan";
import { OnboardingBrandKitForm } from "@/features/brand-kit/onboarding-brand-kit-form";

type Step = "url" | "scanning" | "error" | "review";

export function OnboardingFlow({ initialUrl }: { initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl);
  const scan = useScan(url);
  const step = stepFor(url, scan.status);

  return (
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
          <div className="mx-auto max-w-xl">
            <h1 className="type-title">Which website should the agent read?</h1>
            <p className="mt-2 mb-8 text-muted-foreground">
              It looks at the pages, colours, typefaces and writing to draft a brand kit.
            </p>
            <UrlForm onSubmit={setUrl} autoFocus />
          </div>
        )}

        {step === "scanning" && url && <ScanProgress url={url} activeIndex={scan.step} />}

        {step === "error" && scan.error && <ErrorState error={new Error(scan.error)} onRetry={scan.restart} />}

        {step === "review" && url && scan.result && <OnboardingBrandKitForm url={url} scan={scan.result} />}
      </motion.div>
    </AnimatePresence>
  );
}

function stepFor(url: string | null, status: ReturnType<typeof useScan>["status"]): Step {
  if (!url) return "url";
  if (status === "done") return "review";
  if (status === "error") return "error";
  return "scanning";
}
