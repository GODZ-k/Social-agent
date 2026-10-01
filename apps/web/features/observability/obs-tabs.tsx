import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ObsRange, Release } from "@/lib/types";
import { AutoRefreshToggle } from "./auto-refresh-toggle";
import { RangePicker } from "./range-picker";
import { FilterMenu } from "./filter-menu";
import { ReleasePicker } from "./release-picker";
import { signozLogsUrl } from "./signoz";
import { TOOLBAR_PILL_CLASS } from "./toolbar-pill";

const TABS = [
  { key: "overview", label: "Overview", href: "/admin/observability" },
  { key: "agents", label: "Agents", href: "/admin/observability/agents" },
  { key: "server", label: "Server", href: "/admin/observability/server" },
  { key: "frontend", label: "Frontend", href: "/admin/observability/frontend" },
] as const;

export type ObsTab = (typeof TABS)[number]["key"];

/** The Overview/Agents/Server/Frontend switch, the range and the filter, shared by every top-level observability page. */
export function ObsTabs({
  active,
  checkedAt,
  range,
  brandId,
  releases,
  activeReleaseId,
}: {
  active: ObsTab;
  checkedAt: string;
  range: ObsRange;
  brandId: string | null;
  /** The Frontend tab's release history, for its "All releases" dropdown. */
  releases?: Release[];
  activeReleaseId?: string;
}) {
  const query = new URLSearchParams();
  if (range !== "24h") query.set("range", range);
  if (brandId) query.set("brand", brandId);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div role="tablist" aria-label="Observability" className="inline-flex rounded-full bg-secondary p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`${tab.href}${suffix}`}
            role="tab"
            aria-selected={tab.key === active}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium whitespace-nowrap",
              tab.key === active ? "bg-card text-foreground shadow-raised" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <AutoRefreshToggle checkedAt={checkedAt} />
        <div className="hidden h-5 w-px bg-border sm:block" />
        <RangePicker range={range} />
        <FilterMenu brandId={brandId} />
        {active === "frontend" && releases && activeReleaseId && <ReleasePicker releases={releases} activeId={activeReleaseId} />}
        {active === "server" && (
          <a href={signozLogsUrl()} target="_blank" rel="noreferrer" className={TOOLBAR_PILL_CLASS}>
            Open in SigNoz <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
