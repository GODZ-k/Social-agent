import { Image as ImageIcon, Layers, Play, Target, type LucideIcon } from "lucide-react";
import type { AnalyticsBreakdown, AnalyticsReport } from "@/lib/types";
import { FORMAT_LABEL, PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { ComparisonPanel, type ComparisonRow } from "./comparison-panel";
import { SoonPanel } from "./soon-panel";
import { per100 } from "./report-format";

const FORMAT_ICON = { image: ImageIcon, carousel: Layers, reel: Play, story: Layers } as const;

const PANEL_DESCRIPTION = "Average people reached per post.";
const BAR_FOOTNOTE = "Bars: average people reached per post. Longer is better.";

/** Posts grouped three ways, so a shop owner can see which kind to make more of. */
export function ComparisonSection({ report }: { report: AnalyticsReport }) {
  if (report.phase === "first_week") {
    return (
      <SoonPanel
        title="What works best for you"
        description="Formats, platforms and themes compared."
        icon={<Layers />}
        heading="A little more time"
        body="After a few more posts there's enough to compare formats and platforms fairly."
      />
    );
  }

  const formatRows = report.byFormat.map((row) =>
    comparisonRow(row, row.format, FORMAT_LABEL[row.format], iconFor(FORMAT_ICON[row.format])),
  );
  const platformRows = report.byPlatform.map((row) =>
    comparisonRow(
      row,
      row.platform,
      PLATFORM_LABEL[row.platform],
      <PlatformIcon platform={row.platform} className="size-4 text-muted-foreground" />,
    ),
  );
  const themeRows = report.byTheme.map((row) => comparisonRow(row, row.pillarId, row.name, iconFor(Target)));

  return (
    <div className="grid gap-3">
      <div>
        <h2 className="type-heading">What works best for you</h2>
        <p className="type-label mt-0.5">Your posts grouped three ways, so you can see which kind to make more of.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <ComparisonPanel title="By format" description={PANEL_DESCRIPTION} rows={formatRows} footnote={BAR_FOOTNOTE} />
        <ComparisonPanel title="By platform" description={PANEL_DESCRIPTION} rows={platformRows} footnote={BAR_FOOTNOTE} />
        <ComparisonPanel title="By theme" description={PANEL_DESCRIPTION} rows={themeRows} footnote="Themes come from your strategy." />
      </div>
    </div>
  );
}

function comparisonRow(breakdown: AnalyticsBreakdown, key: string, label: string, icon: React.ReactNode): ComparisonRow {
  return {
    key,
    label,
    icon,
    posts: breakdown.posts,
    avgReach: breakdown.posts ? breakdown.reach / breakdown.posts : 0,
    savesPer100: per100(breakdown.saves, breakdown.reach),
  };
}

function iconFor(Icon: LucideIcon) {
  return <Icon className="size-4 text-muted-foreground" />;
}
