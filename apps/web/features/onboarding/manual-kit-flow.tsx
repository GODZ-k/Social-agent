"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { spring } from "@repo/ui/lib/motion";
import { OnboardingBrandKitForm } from "@/features/brand-kit/onboarding-brand-kit-form";
import { ManualKitForm } from "@/features/onboarding/manual-kit-form";
import { ManualOnboardingSteps } from "@/features/onboarding/manual-onboarding-steps";
import { toScanResult, type ManualValues } from "@/features/onboarding/manual-kit-schema";
import type { ScanResult } from "@/lib/types";

/** FL-1: the short form's answers become the same ScanResult shape a scan returns, so filling it in by
 * hand hands off to the same review step (S17a) and the same "create the brand" action a scan uses. */
export function ManualKitFlow() {
  const [scan, setScan] = useState<ScanResult | null>(null);

  return (
    <>
      <ManualOnboardingSteps />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={scan ? "review" : "form"}
          initial={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
          transition={spring.smooth}
        >
          {scan ? (
            <OnboardingBrandKitForm url="" scan={scan} />
          ) : (
            <ManualKitForm onContinue={(values: ManualValues) => setScan(toScanResult(values))} />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
