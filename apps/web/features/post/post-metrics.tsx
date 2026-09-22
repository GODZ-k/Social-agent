import type { PostMetrics as Metrics } from "@/lib/types";
import { formatCompact } from "@/lib/utils";

export function PostMetrics({ metrics }: { metrics: Metrics }) {
  return (
    <dl className="grid grid-cols-5 gap-2 rounded-lg bg-secondary p-3 text-center">
      {(Object.entries(metrics) as [string, number][]).map(([k, v]) => (
        <div key={k}>
          <dd className="type-number text-[1.0625rem]">{formatCompact(v)}</dd>
          <dt className="type-label capitalize">{k}</dt>
        </div>
      ))}
    </dl>
  );
}
