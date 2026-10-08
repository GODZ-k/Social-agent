import type { Verdict } from "@/lib/types";
import { VerdictBadge } from "./verdict-badge";

export function KpiCard({
  label,
  icon,
  verdict,
  value,
  why,
}: {
  label: string;
  icon: React.ReactNode;
  verdict: Verdict;
  value: string;
  why: string;
}) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-raised md:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          {icon}
          {label}
        </span>
        <VerdictBadge verdict={verdict} />
      </div>
      <p className="type-number mt-3 text-[2rem] leading-none md:text-[2.25rem]">{value}</p>
      <p className="type-label mt-2 leading-snug">{why}</p>
    </div>
  );
}
