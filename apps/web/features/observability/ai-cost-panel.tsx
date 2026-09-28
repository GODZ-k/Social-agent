import { format, parseISO, isToday } from "date-fns";
import { Panel } from "@repo/ui/components/states";
import { formatUsd } from "./format";
import { niceCeil } from "./trend-area";

/** What the agents cost per day, last 7 days, as a bar per day with today filled solid, against a $ y-axis. */
export function AiCostPanel({ byDay }: { byDay: { date: string; cost: number }[] }) {
  const total = byDay.reduce((sum, d) => sum + d.cost, 0);
  const max = niceCeil(Math.max(...byDay.map((d) => d.cost), 1));
  const width = 340;
  const height = 220;
  const padLeft = 30;
  const padBottom = 28;
  const top = 8;
  const plotWidth = width - padLeft;
  const plotHeight = height - padBottom - top;
  const gap = 12;
  const barWidth = (plotWidth - gap * (byDay.length - 1)) / byDay.length;
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const y = (v: number) => top + plotHeight - (v / max) * plotHeight;
  const barLeft = (i: number) => padLeft + i * (barWidth + gap);

  return (
    <Panel>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="type-heading">AI cost</h2>
          <p className="type-label mt-1">What the agents cost per day.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="type-number text-xl">{formatUsd(total)}</p>
          <p className="type-label mt-0.5">Last 7 days</p>
        </div>
      </div>
      <div className="relative text-muted-foreground" style={{ aspectRatio: `${width} / ${height}` }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 size-full" role="img" aria-label="AI cost per day, last 7 days">
          {gridValues.map((v, i) => (
            <line key={i} x1={padLeft} x2={width} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={0.1} />
          ))}
          {byDay.map((day, i) => {
            const today = isToday(parseISO(day.date));
            return (
              <rect
                key={day.date}
                x={barLeft(i)}
                y={y(day.cost)}
                width={barWidth}
                height={(day.cost / max) * plotHeight}
                rx={8}
                fill={today ? "var(--brand)" : "color-mix(in srgb, var(--brand) 18%, var(--card))"}
              />
            );
          })}
        </svg>
        {gridValues.map((v, i) => (
          <span
            key={i}
            className="absolute whitespace-nowrap text-xs sm:text-[0.8125rem]"
            style={{ left: `${(padLeft / width) * 100}%`, top: `${(y(v) / height) * 100}%`, transform: "translate(calc(-100% - 0.375rem), -50%)" }}
          >
            ${v}
          </span>
        ))}
        {byDay.map((day, i) => {
          const center = barLeft(i) + barWidth / 2;
          const today = isToday(parseISO(day.date));
          return (
            <span
              key={day.date}
              className="absolute -translate-x-1/2 whitespace-nowrap text-xs sm:text-[0.8125rem]"
              style={{ left: `${(center / width) * 100}%`, top: `${((height - padBottom + 6) / height) * 100}%` }}
            >
              {today ? "Today" : format(parseISO(day.date), "EEE")}
            </span>
          );
        })}
      </div>
    </Panel>
  );
}
