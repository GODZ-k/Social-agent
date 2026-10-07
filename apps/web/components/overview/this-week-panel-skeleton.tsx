import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { ThisWeekFrame } from "./this-week-frame";

export function ThisWeekPanelSkeleton({ brandId, basePath = "/c" }: { brandId: string; basePath?: WorkspaceBasePath }) {
  return (
    <ThisWeekFrame brandId={brandId} basePath={basePath}>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-7" aria-busy aria-label="Loading this week">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" style={{ animationDelay: `${i * 60}ms` }} />
        ))}
      </div>
    </ThisWeekFrame>
  );
}
