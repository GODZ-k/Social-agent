"use client";

import type { Analytics } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";
import { RankedBars } from "@repo/ui/components/social/charts";
import { FORMAT_LABEL } from "@repo/ui/components/social/platform";
import { percent } from "./percent";

export function FormatPanel({ byFormat }: { byFormat: Analytics["byFormat"] }) {
  const formats = byFormat.map((f) => ({ label: FORMAT_LABEL[f.format], value: f.engagementRate }));
  return (
    <Panel aria-labelledby="format-heading">
      <h2 id="format-heading" className="type-heading">Engagement by format</h2>
      <p className="type-label mt-1 mb-3">Average engagement rate per post.</p>
      <RankedBars rows={formats} metric="Engagement rate" formatValue={percent} />
    </Panel>
  );
}
