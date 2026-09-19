"use client";

import { TrendChart } from "@repo/ui/components/social/charts";
import { Panel } from "@repo/ui/components/states";
import { formatCompact } from "@repo/ui/lib/utils";
import { REACH_TREND } from "@/lib/content/posts";

const LEARNINGS = [
  {
    finding: "Before-and-after carousels earn three times the saves of single images.",
    evidence: "From 6 carousels and 11 images last month.",
  },
  {
    finding: "Monday evening reels reach the most people who don't follow you yet.",
    evidence: "From 4 reels posted at different times.",
  },
];

/** What the Learn step produces: a trend, and findings that each point at their evidence. */
export function ResultsStrip() {
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <Panel className="min-w-0">
        <h3 className="type-heading">Reach</h3>
        <p className="type-label mt-1">An example brand's first 30 days.</p>
        <div className="mt-4">
          <TrendChart rows={REACH_TREND} metric="Reach" formatValue={formatCompact} />
        </div>
      </Panel>
      <div className="grid min-w-0 content-start gap-5">
        {LEARNINGS.map((item) => (
          <Panel key={item.finding}>
            <p className="font-medium">{item.finding}</p>
            <p className="type-label mt-2">{item.evidence}</p>
          </Panel>
        ))}
        <p className="type-label px-1">Example findings. Yours come from your own posts.</p>
      </div>
    </div>
  );
}
