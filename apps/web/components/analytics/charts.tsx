"use client";

import { useMemo } from "react";
import { areaY, barX, defineChart, lineY } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { tooltip } from "@tanstack/charts/tooltip";
import { Chart } from "@tanstack/react-charts";

// Module scope so server and client format identically.
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

// A stable default: an inline arrow would rebuild every chart definition on each render.
const formatCompactValue = (value: number) => compact.format(value);

const grid = { stroke: "currentColor", strokeOpacity: 0.1 };

/**
 * Charts take the client's brand colour through --ts-chart-1 and draw guides in
 * currentColor, so light/dark and the per-client tint need no chart code.
 */
const chartFrame =
  "min-w-0 text-muted-foreground [--ts-chart-1:var(--brand)] [--ts-chart-tooltip-background:var(--popover)] [--ts-chart-tooltip-color:var(--popover-foreground)] [--ts-chart-tooltip-border:var(--border)] [--ts-chart-tooltip-border-radius:0.75rem]";

export interface TrendRow {
  label: string;
  value: number;
}

export function TrendChart({
  rows,
  metric,
  formatValue = formatCompactValue,
}: {
  rows: readonly TrendRow[];
  metric: string;
  formatValue?: (value: number) => string;
}) {
  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          // areaY doesn't stroke its own top edge, so the line is layered on it.
          areaY(rows, { x: "label", y: "value", fill: "var(--ts-chart-1)", fillOpacity: 0.14 }),
          lineY(rows, { x: "label", y: "value", stroke: "var(--ts-chart-1)", strokeWidth: 2.25 }),
        ],
        scales: {
          // One label a week, counted back from today, instead of letting 30 daily labels collide.
          x: {
            scale: () => scalePoint<string>().padding(0.02),
            axis: { ticks: { values: rows.filter((_, i) => (rows.length - 1 - i) % 7 === 0).map((r) => r.label) } },
          },
          y: { scale: scaleLinear, nice: true, grid, axis: { ticks: { count: 4, format: (v: number) => formatValue(v) } } },
        },
        focus: "nearest-x",
        maxFocusDistance: Number.POSITIVE_INFINITY,
        svgAnimation: true,
        tooltip: {
          use: tooltip,
          items: ["x", { channel: "y", label: metric, text: (point) => formatValue(point.yValue) }],
        },
      }),
    [rows, metric, formatValue],
  );

  return (
    <div className={chartFrame}>
      <Chart definition={definition} height={280} initialWidth={760} ariaLabel={`${metric} over the last 30 days`} />
    </div>
  );
}

export interface BarRow {
  label: string;
  value: number;
}

/** Horizontal bars: category labels stay readable at any width. */
export function RankedBars({
  rows,
  metric,
  formatValue = formatCompactValue,
}: {
  rows: readonly BarRow[];
  metric: string;
  formatValue?: (value: number) => string;
}) {
  const definition = useMemo(
    () =>
      defineChart({
        marks: [barX(rows, { x: "value", y: "label", fill: "var(--ts-chart-1)", radius: { end: 6 }, maxThickness: 26 })],
        scales: {
          x: { scale: scaleLinear, nice: true, grid, axis: { ticks: { count: 4, format: (v: number) => formatValue(v) } } },
          y: { scale: () => scaleBand<string>().padding(0.35) },
        },
        svgAnimation: true,
        tooltip: {
          use: tooltip,
          items: [{ channel: "y", label: "" }, { channel: "x", label: metric, text: (point) => formatValue(point.xValue) }],
        },
      }),
    [rows, metric, formatValue],
  );

  return (
    <div className={chartFrame}>
      <Chart definition={definition} height={Math.max(160, rows.length * 52)} initialWidth={420} ariaLabel={metric} />
    </div>
  );
}
