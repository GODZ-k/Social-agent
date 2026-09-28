/** A stat tile's tiny trend line: no axes, just the shape of the last N values. */
export function Sparkline({ values, tone = "brand" }: { values: number[]; tone?: "brand" | "destructive" }) {
  if (values.length < 2) return null;
  const width = 88;
  const height = 30;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - 3 - ((v - min) / span) * (height - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke = tone === "destructive" ? "var(--destructive)" : "var(--brand)";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="shrink-0">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
