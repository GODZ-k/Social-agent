interface Row {
  label: string;
  primary: number;
  secondary?: number;
}

/** The chart's default two colours: brand for the primary line, a lighter tint of it for the secondary. */
const DEFAULT_PRIMARY_COLOR = "var(--brand)";
const DEFAULT_SECONDARY_COLOR = "color-mix(in srgb, var(--brand) 42%, var(--card))";

/** Rounds a value up to a "nice" number (1/1.5/2/3/4/5/6/8/10 x a power of ten), so axis ticks read as round numbers instead of the data's raw max. */
export function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const residual = value / magnitude;
  const steps = [1, 1.5, 2, 3, 4, 5, 6, 8, 10];
  const niceResidual = steps.find((s) => s >= residual) ?? 10;
  return niceResidual * magnitude;
}

/** Picks a fixed index step (1/2/3/4/6/8/12/24/48) close to an even split of the row count, so x ticks land at a constant interval instead of a fractional one. */
function niceStep(lastIndex: number, desiredTicks: number): number {
  const raw = lastIndex / desiredTicks;
  const steps = [1, 2, 3, 4, 6, 8, 12, 24, 48];
  return steps.find((s) => s >= raw) ?? steps[steps.length - 1]!;
}

/** Keeps the first and last x labels inside the chart: the first hangs right of its tick, the last left of it, the rest centre on it. */
function tickTransform(index: number, lastIndex: number): string {
  if (index === 0) return "translateX(0)";
  if (index === lastIndex) return "translateX(-100%)";
  return "translateX(-50%)";
}

/**
 * A wide line-and-area chart for the hourly panels (requests, latency, tokens,
 * sessions with an error). The plot is SVG; the axis labels are ordinary HTML
 * placed over it by percentage, so they render at a fixed, readable size at
 * every width instead of scaling down (and clipping) with the SVG viewBox.
 */
export function TrendArea({
  rows,
  primaryColor = DEFAULT_PRIMARY_COLOR,
  secondaryColor = DEFAULT_SECONDARY_COLOR,
  formatValue = (n) => `${Math.round(n)}`,
  releaseIndex,
}: {
  rows: Row[];
  primaryColor?: string;
  secondaryColor?: string;
  formatValue?: (n: number) => string;
  /** The row index the last release lands on, for the dashed marker. */
  releaseIndex?: number;
}) {
  const width = 620;
  const height = 220;
  const padLeft = 58;
  const padBottom = 24;
  const top = 16;
  const plotWidth = width - padLeft;
  const plotHeight = height - padBottom - top;

  const values = rows.flatMap((r) => [r.primary, r.secondary ?? r.primary]);
  const max = niceCeil(Math.max(...values, 1));
  const step = plotWidth / Math.max(rows.length - 1, 1);
  const y = (v: number) => top + plotHeight - (v / max) * plotHeight;
  const x = (i: number) => padLeft + i * step;

  const linePoints = (key: "primary" | "secondary") =>
    rows
      .filter((r) => r[key] !== undefined)
      .map((r, i) => `${x(i).toFixed(1)},${y(r[key]!).toFixed(1)}`)
      .join(" ");

  const areaPoints = `${padLeft},${top + plotHeight} ${linePoints("primary")} ${x(rows.length - 1).toFixed(1)},${top + plotHeight}`;

  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

  const hasRelease = releaseIndex !== undefined && releaseIndex >= 0;

  const lastIndex = rows.length - 1;
  const tickStep = niceStep(lastIndex, 6);
  const tickIndexes: number[] = [];
  for (let i = 0; i <= lastIndex; i += tickStep) tickIndexes.push(i);
  if (tickIndexes[tickIndexes.length - 1] !== lastIndex) tickIndexes.push(lastIndex);

  return (
    <div className="relative text-muted-foreground" style={{ aspectRatio: `${width} / ${height}` }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 size-full" role="img" aria-label="Value over time">
        {gridValues.map((v, i) => (
          // Rounded values can repeat on a small-range chart (a handful of hourly hits), so the
          // key is the gridline's position, not its value.
          <line key={i} x1={padLeft} x2={width} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={0.1} />
        ))}
        {hasRelease && (
          <line
            x1={x(releaseIndex)}
            x2={x(releaseIndex)}
            y1={top}
            y2={top + plotHeight}
            stroke="currentColor"
            strokeOpacity={0.35}
            strokeDasharray="3 3"
          />
        )}
        <polygon points={areaPoints} fill={primaryColor} fillOpacity={0.12} />
        <polyline points={linePoints("primary")} fill="none" stroke={primaryColor} strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />
        {rows.some((r) => r.secondary !== undefined) && (
          <polyline points={linePoints("secondary")} fill="none" stroke={secondaryColor} strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />
        )}
      </svg>
      {hasRelease && (
        <span
          className="absolute -translate-x-1/2 whitespace-nowrap text-[0.6875rem]"
          style={{ left: `${(x(releaseIndex) / width) * 100}%`, top: `${((top - 12) / height) * 100}%` }}
        >
          Release
        </span>
      )}
      {gridValues.map((v, i) => (
        <span
          key={i}
          className="absolute whitespace-nowrap text-xs sm:text-[0.8125rem]"
          style={{ left: `${(padLeft / width) * 100}%`, top: `${(y(v) / height) * 100}%`, transform: "translate(calc(-100% - 0.5rem), -50%)" }}
        >
          {formatValue(v)}
        </span>
      ))}
      {tickIndexes.map((i) => (
        <span
          key={i}
          className="absolute whitespace-nowrap text-xs sm:text-[0.8125rem]"
          style={{
            left: `${(x(i) / width) * 100}%`,
            top: `${((height - padBottom + 6) / height) * 100}%`,
            transform: tickTransform(i, lastIndex),
          }}
        >
          {i === lastIndex ? "Now" : rows[i]?.label}
        </span>
      ))}
    </div>
  );
}
