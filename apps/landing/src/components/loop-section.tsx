"use client";

import { useState } from "react";
import { LoopTrack } from "@repo/ui/components/social/loop-track";
import type { LoopStage } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { cn } from "@repo/ui/lib/utils";
import { LOOP_STEPS } from "@/lib/content/loop";
import { RevealGroup, RevealItem } from "./reveal";

/** The six steps, with the product's own progress track following whichever step is being read. */
export function LoopSection() {
  const [stage, setStage] = useState<LoopStage>("onboarding");

  return (
    <div>
      <Panel aria-label="Where the agent is in its loop">
        <LoopTrack stage={stage} />
      </Panel>
      <RevealGroup as="ol" className="mt-8 grid gap-x-10 gap-y-2 md:grid-cols-2">
        {LOOP_STEPS.map((step, i) => {
          const current = step.stage === stage;
          return (
            <RevealItem as="li" key={step.stage} className="min-w-0">
              <button
                type="button"
                aria-pressed={current}
                onClick={() => setStage(step.stage)}
                onFocus={() => setStage(step.stage)}
                onPointerEnter={(e) => e.pointerType === "mouse" && setStage(step.stage)}
                className={cn(
                  "flex w-full gap-4 rounded-xl p-4 text-left transition-colors",
                  current ? "bg-tint" : "hover:bg-accent",
                )}
              >
                <span
                  className={cn(
                    "type-number w-6 shrink-0 text-2xl tabular-nums",
                    current ? "text-tint-foreground" : "text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="type-heading block">{step.title}</span>
                  <span className="mt-1.5 block text-muted-foreground">{step.body}</span>
                </span>
              </button>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </div>
  );
}
