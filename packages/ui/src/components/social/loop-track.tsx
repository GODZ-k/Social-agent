"use client";

import { motion } from "motion/react";
import { RefreshCw } from "lucide-react";
import type { LoopStage } from "./types";
import { LOOP, stageInfo } from "./loop-stages";
import { spring } from "../../lib/motion";
import { cn } from "../../lib/utils";

export { LOOP, stageInfo } from "./loop-stages";

/** Compact: a row of ticks with the current stage filled. For lists. */
export function LoopTicks({ stage, className }: { stage: LoopStage; className?: string }) {
  const index = LOOP.findIndex((s) => s.stage === stage);
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="img"
      aria-label={`Stage ${index + 1} of ${LOOP.length}: ${stageInfo(stage).label}`}
    >
      {LOOP.map((s, i) => (
        <span
          key={s.stage}
          className={cn(
            "h-1.5 rounded-full",
            i === index ? "w-5 bg-primary" : i < index ? "w-1.5 bg-primary/45" : "w-1.5 bg-input",
          )}
        />
      ))}
    </div>
  );
}

/** Full: the six stages in order, with a marker that slides to the current one. */
export function LoopTrack({ stage }: { stage: LoopStage }) {
  const index = LOOP.findIndex((s) => s.stage === stage);
  return (
    <div>
      <ol className="grid grid-cols-6 gap-1">
        {LOOP.map((s, i) => {
          const current = i === index;
          return (
            <li key={s.stage} className="relative min-w-0" aria-current={current ? "step" : undefined}>
              <div className={cn("h-1.5 rounded-full", i <= index ? "bg-primary/35" : "bg-input")}>
                {current && (
                  <motion.div layoutId="loop-marker" className="h-full rounded-full bg-primary" transition={spring.smooth} />
                )}
              </div>
              <p
                className={cn(
                  "mt-2 truncate text-[0.75rem] font-medium sm:text-[0.8125rem]",
                  current ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </p>
            </li>
          );
        })}
      </ol>
      <p className="type-label mt-3 flex items-center gap-1.5">
        <RefreshCw className="size-3.5" />
        After Learn, the agent writes a new strategy and the loop starts again.
      </p>
    </div>
  );
}
