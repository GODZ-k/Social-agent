import { Panel } from "@repo/ui/components/states";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { PanelStat } from "@repo/ui/components/panel-stat";
import { TrendArea } from "./trend-area";
import { ChartLegend } from "@repo/ui/components/chart-legend";
import { hourLabel } from "./format";

/** An hourly line panel: title, a running total, a top legend, then the chart. Reused across Overview, Agents and Server. */
export function HourlyPanel({
  title,
  description,
  total,
  caption,
  rows,
  primaryLabel,
  secondaryLabel,
  primaryColor,
  secondaryColor,
  formatValue,
  releaseAt,
  toolbar,
}: {
  title: string;
  description: string;
  total?: React.ReactNode;
  /** A small line under the total, naming what it counts ("Total requests", "Typical run"). */
  caption?: string;
  rows: { at: string; primary: number; secondary?: number }[];
  primaryLabel: string;
  secondaryLabel?: string;
  primaryColor?: string;
  secondaryColor?: string;
  formatValue?: (n: number) => string;
  /** The last release's timestamp, drawn as a dashed marker on the chart. */
  releaseAt?: string;
  /** A toggle (Segmented) on the legend's row, left of it, for panels with more than one view. */
  toolbar?: React.ReactNode;
}) {
  const releaseIndex = releaseAt ? rows.findIndex((r) => r.at >= releaseAt) : undefined;

  return (
    <Panel>
      <PanelHeader title={title} description={description} right={total && <PanelStat value={total} caption={caption} />} />
      {(toolbar || secondaryLabel) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {toolbar}
          {secondaryLabel && (
            <ChartLegend
              items={[
                { label: primaryLabel, color: primaryColor ?? "var(--brand)" },
                { label: secondaryLabel, color: secondaryColor ?? "color-mix(in srgb, var(--brand) 42%, var(--card))" },
              ]}
            />
          )}
        </div>
      )}
      <TrendArea
        rows={rows.map((r) => ({ label: hourLabel(r.at), primary: r.primary, secondary: r.secondary }))}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        formatValue={formatValue}
        releaseIndex={releaseIndex}
      />
    </Panel>
  );
}
