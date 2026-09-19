"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { BRAND_SCAN_STEPS } from "@/lib/api/client";
import { spring } from "@repo/ui/lib/motion";
import { cn, prettyUrl } from "@/lib/utils";

/**
 * Shows the agent's real progress, one named step at a time. Waiting is easier
 * when you can see what is being done and how much is left.
 */
export function ScanProgress({ url, activeIndex }: { url: string; activeIndex: number }) {
  const total = BRAND_SCAN_STEPS.length;
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="type-title">Reading {prettyUrl(url)}</h1>
      <p className="mt-2 text-muted-foreground">This takes a few seconds. You&apos;ll be able to change anything it gets wrong.</p>

      <div
        className="mt-8 h-1.5 overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.min(activeIndex, total)}
        aria-label="Website scan progress"
      >
        <motion.div
          className="h-full origin-left rounded-full bg-primary"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: Math.min(activeIndex + 0.5, total) / total }}
          transition={{ type: "spring", bounce: 0, duration: 1.1 }}
        />
      </div>

      <ol className="mt-7 grid gap-1" aria-live="polite">
        {BRAND_SCAN_STEPS.map((step, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-3.5 rounded-lg px-1 py-2.5 transition-opacity duration-300",
                !done && !active && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full transition-colors duration-300",
                  done ? "bg-primary text-primary-foreground" : active ? "bg-tint-strong" : "bg-secondary",
                )}
              >
                {done ? (
                  <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.snappy}>
                    <Check className="size-3.5" strokeWidth={3} />
                  </motion.span>
                ) : active ? (
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block font-medium">{step.label}</span>
                <span className="type-label block">{step.detail}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
