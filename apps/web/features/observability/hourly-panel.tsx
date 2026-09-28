import { Panel } from "@repo/ui/components/states";
import { TrendArea } from "./trend-area";
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
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-heading">{title}</h2>
          <p className="type-label mt-1">{description}</p>
        </div>
        {total && (
          <div className="shrink-0 text-right">
            <p className="type-number text-xl">{total}</p>
            {caption && <p className="type-label mt-0.5">{caption}</p>}
          </div>
        )}
      </div>
      {(toolbar || secondaryLabel) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {toolbar}
          {secondaryLabel && (
            <div className="flex flex-wrap gap-4 text-[0.8125rem]">
              <span className="flex items-center gap-1.5">
                <i aria-hidden className="inline-block size-2 rounded-full" style={{ background: primaryColor ?? "var(--brand)" }} />
                {primaryLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <i aria-hidden className="inline-block size-2 rounded-full" style={{ background: secondaryColor ?? "color-mix(in srgb, var(--brand) 42%, var(--card))" }} />
                {secondaryLabel}
              </span>
            </div>
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
