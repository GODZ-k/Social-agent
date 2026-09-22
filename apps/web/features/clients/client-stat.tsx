import { TrendingDown, TrendingUp } from "lucide-react";
import { cn, formatDelta } from "@/lib/utils";

export function ClientStat({ label, value, delta }: { label: string; value: string; delta: number }) {
  const Icon = delta < 0 ? TrendingDown : TrendingUp;
  return (
    <div>
      <dt className="type-label">{label}</dt>
      <dd className="flex items-baseline gap-1.5">
        <span className="type-number text-[1.0625rem]">{value}</span>
        {delta !== 0 && (
          <span className={cn("flex items-center gap-0.5 text-xs tabular-nums", delta < 0 ? "text-destructive" : "text-success")}>
            <Icon className="size-3" />
            {formatDelta(delta)}
          </span>
        )}
      </dd>
    </div>
  );
}
