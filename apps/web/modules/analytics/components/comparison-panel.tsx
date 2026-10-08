import { Sparkles } from "lucide-react";
import { formatNumber } from "@repo/ui/lib/utils";
import { Panel } from "@repo/ui/components/states";
import { postsLabel } from "@/lib/report-format";
import type { ComparisonRow } from "@/modules/analytics/types";

/** One "grouped three ways" panel: ranked bars, plus one honest takeaway line drawn from the numbers. */
export function ComparisonPanel({
  title,
  description,
  rows,
  footnote,
}: {
  title: string;
  description: string;
  rows: ComparisonRow[];
  footnote: string;
}) {
  if (rows.length === 0) return null;
  const byReach = [...rows].sort((a, b) => b.avgReach - a.avgReach);
  const topReach = byReach[0]!;
  const topSaves = [...rows].sort((a, b) => b.savesPer100 - a.savesPer100)[0]!;
  const max = topReach.avgReach || 1;

  return (
    <Panel aria-label={title}>
      <h3 className="type-heading text-base">{title}</h3>
      <p className="type-label mt-0.5">{description}</p>
      <p className="mt-3 mb-4 flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-sm leading-snug">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-tint-foreground" />
        <span>
          <b className="font-semibold">{topReach.label}</b> reaches the most people.
          {topSaves.key !== topReach.key && (
            <>
              {" "}
              <b className="font-semibold">{topSaves.label}</b> gets saved the most.
            </>
          )}
        </span>
      </p>
      <div className="grid gap-3">
        {byReach.map((row) => (
          <div key={row.key} className="grid gap-1.5 border-t border-border pt-3 first:border-0 first:pt-0">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                {row.icon}
                <span className="truncate">{row.label}</span>
                <span className="type-label font-normal">{postsLabel(row.posts)}</span>
              </span>
              <span className="type-number shrink-0 text-sm">{formatNumber(Math.round(row.avgReach))} people</span>
            </div>
            <div className="h-2 rounded-full bg-secondary">
              <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(6, (row.avgReach / max) * 100)}%` }} />
            </div>
            <p className="type-label">
              {row.savesPer100} saves per 100 people{row.key === topSaves.key && rows.length > 1 ? ", the most" : ""}
            </p>
          </div>
        ))}
      </div>
      <p className="type-label mt-3">{footnote}</p>
    </Panel>
  );
}
