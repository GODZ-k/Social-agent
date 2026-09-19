"use client";

import { useEffect, useState } from "react";
import { LoopTrack } from "@repo/ui/components/social/loop-track";
import { LOOP_STEPS } from "@/lib/content/loop";
import type { LoopStage } from "@/lib/types";

/**
 * The product's progress track, pinned under the header and driven by the
 * scroll: its marker slides to whichever step is crossing the middle of the
 * screen. Steps are found by their `data-stage` attribute, so the page that
 * lists them stays a server component.
 */
export function LoopFollower() {
  const [stage, setStage] = useState<LoopStage>(LOOP_STEPS[0]!.stage);

  useEffect(() => {
    const steps = document.querySelectorAll<HTMLElement>("[data-stage]");
    // A thin band across the middle of the viewport: whichever step touches it is the current one.
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.find((e) => e.isIntersecting);
        if (entry) setStage((entry.target as HTMLElement).dataset.stage as LoopStage);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);

  return (
    // Floating chrome over scrolling content, so it takes the same material as the header.
    // Pinned from md only: on a phone the header plus a second bar would cover too much.
    <div className="material z-30 mt-10 rounded-xl px-5 py-4 md:sticky md:top-[5.25rem] md:mt-14">
      <LoopTrack stage={stage} />
    </div>
  );
}
