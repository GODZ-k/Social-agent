import { Badge } from "@repo/ui/components/badge";
import { Panel } from "@repo/ui/components/states";
import { TrendChart } from "@repo/ui/components/social/charts";

// A fixed, clearly-labelled illustration of the chart this page draws once real posts have results.
const SAMPLE_ROWS = [40, 65, 58, 80, 74, 96, 88, 110, 102, 128, 118, 140, 132, 156].map((value, i) => ({
  label: `Day ${i + 1}`,
  value,
}));

/** Shown only before any post has gone out, so the empty page still shows what "Day by day" will look like. */
export function AnalyticsPreviewChart() {
  return (
    <Panel aria-label="Example of the day-by-day chart" className="relative opacity-70">
      <Badge variant="neutral" className="absolute top-5 right-5 md:top-6 md:right-6">
        Example
      </Badge>
      <h2 className="type-heading">Day by day</h2>
      <p className="type-label mt-0.5">People who saw one of your posts each day.</p>
      <div className="mt-4">
        <TrendChart rows={SAMPLE_ROWS} metric="People reached" />
      </div>
    </Panel>
  );
}
