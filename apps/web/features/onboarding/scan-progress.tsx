"use client";

import { motion } from "motion/react";
import { Check, Clock, LoaderCircle } from "lucide-react";
import { BRAND_SCAN_STEPS } from "@/lib/scan-steps";
import { spring } from "@repo/ui/lib/motion";
import { Panel } from "@repo/ui/components/states";
import { Button } from "@repo/ui/components/button";
import { cn, prettyUrl } from "@/lib/utils";
import type { ScanResult } from "@/lib/types";

const KIT_ROWS = [
  { label: "Name", readyFrom: 0 },
  { label: "Colours", readyFrom: 1 },
  { label: "Typefaces", readyFrom: 1 },
  { label: "What you sell", readyFrom: 3 },
  { label: "How you sound", readyFrom: 2 },
  { label: "Who it's for", readyFrom: 3 },
] as const;

/**
 * Shows the agent's real progress, one named step at a time. Waiting is easier
 * when you can see what is being done and how much is left.
 */
export function ScanProgress({
  url,
  activeIndex,
  preview,
  onChangeAddress,
}: {
  url: string;
  activeIndex: number;
  preview: ScanResult | null;
  onChangeAddress: () => void;
}) {
  const total = BRAND_SCAN_STEPS.length;
  return (
    <div className="mx-auto max-w-3xl">
      <p className="type-label">Reading your website</p>
      <h1 className="type-title mt-1">{prettyUrl(url)}</h1>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel aria-live="polite">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="type-heading text-base">Reading your pages</h2>
            <span className="type-label shrink-0">{timeLeftLabel(activeIndex, total)}</span>
          </div>

          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"
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

          <ol className="mt-5 grid">
            {BRAND_SCAN_STEPS.map((step, i) => {
              const state = stepState(i, activeIndex);
              return (
                <li
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3.5 border-t px-1 py-2.5 transition-opacity duration-300 first:border-t-0",
                    state === "waiting" && "opacity-40",
                  )}
                >
                  <span className={cn("grid size-7 shrink-0 place-items-center rounded-full transition-colors duration-300", markerTone(state))}>
                    {marker(state)}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium">{step.label}</span>
                    <span className="type-label block max-[560px]:hidden">{step.detail}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </Panel>

        <Panel className="max-[560px]:order-first">
          <h2 className="type-heading">Your brand kit so far</h2>
          <p className="type-label mt-1">Your colours, fonts and how you sound. It fills in as the agent reads, and you can change all of it next.</p>
          <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3">
            {KIT_ROWS.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-3 border-t pt-3 first:border-t-0 first:pt-0">
                <span className="type-label shrink-0">{row.label}</span>
                {kitRowStatus(row, activeIndex, preview)}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="type-label flex flex-1 items-start gap-3 rounded-2xl bg-tint px-4.5 py-4 text-tint-foreground">
          <Clock className="mt-0.5 size-3.5 shrink-0" />
          You can leave this page. The scan keeps going, and your brand kit waits for you when you come back.
        </p>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onChangeAddress}>
          Use a different website
        </Button>
      </div>
    </div>
  );
}

type KitRow = (typeof KIT_ROWS)[number];
type FoundLabel = Exclude<KitRow["label"], "How you sound">;

function kitRowStatus(row: KitRow, activeIndex: number, preview: ScanResult | null) {
  if (row.label === "How you sound") {
    // Voice is worked out from everything else, so it never shows a value here; it's ready by the review screen.
    return (
      <span className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-muted-foreground">
        <LoaderCircle className="size-3.5 animate-spin" />
        Reading now
      </span>
    );
  }
  const ready = activeIndex > row.readyFrom;
  if (!ready || !preview) return <span className="skeleton h-4 w-24 rounded-full" />;
  return (
    <span className="flex min-w-0 flex-1 items-center justify-end gap-2">
      {kitValue(row.label, preview)}
      <span className="flex shrink-0 items-center gap-1.5 text-[0.8125rem] font-medium text-success">
        <Check className="size-3.5" strokeWidth={3} />
        Found
      </span>
    </span>
  );
}

function kitValue(label: FoundLabel, preview: ScanResult) {
  switch (label) {
    case "Name":
      return <span className="min-w-0 truncate font-medium">{preview.name}</span>;
    case "Colours":
      return (
        <span className="flex min-w-0 flex-wrap justify-end gap-1.5">
          {preview.brand.colors.map((color) => (
            <span key={color.hex} title={color.hex} className="size-4.5 rounded-md ring-1 ring-border" style={{ background: color.hex }} />
          ))}
        </span>
      );
    case "Typefaces":
      return (
        <span className="min-w-0 truncate">
          <span className="font-medium">{preview.brand.fonts.heading}</span> for headings, <span className="font-medium">{preview.brand.fonts.body}</span>{" "}
          for text
        </span>
      );
    case "What you sell":
      return <span className="min-w-0 truncate">{preview.brand.summary}</span>;
    case "Who it's for":
      return <span className="min-w-0 truncate">{preview.brand.audience}</span>;
  }
}

/** Each step takes about 15 seconds, matching the "about a minute" estimate on the start screen. */
const SECONDS_PER_STEP = 15;

function timeLeftLabel(activeIndex: number, total: number): string {
  const secondsLeft = (total - activeIndex) * SECONDS_PER_STEP;
  if (secondsLeft <= 0) return "Almost done";
  if (secondsLeft >= 60) return "About a minute left";
  return `About ${secondsLeft} seconds left`;
}

type StepState = "done" | "active" | "waiting";

function stepState(index: number, activeIndex: number): StepState {
  if (index < activeIndex) return "done";
  return index === activeIndex ? "active" : "waiting";
}

function markerTone(state: StepState): string {
  if (state === "done") return "bg-success/12 text-success";
  return state === "active" ? "bg-tint-strong" : "bg-secondary";
}

function marker(state: StepState) {
  if (state === "done") {
    return (
      <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.snappy}>
        <Check className="size-3.5" strokeWidth={3} />
      </motion.span>
    );
  }
  if (state === "active") return <span className="size-2 animate-pulse rounded-full bg-primary" />;
  return null;
}
