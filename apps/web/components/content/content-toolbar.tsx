"use client";

import { Search } from "lucide-react";
import type { Platform } from "@social-agent/shared";
import type { PostState } from "@/lib/types";
import { Segmented } from "@repo/ui/components/segmented";
import { PlatformFilterDropdown } from "@/components/filters/platform-filter-dropdown";

export type StatusFilter = "" | PostState;

export function ContentToolbar({
  status,
  onStatusChange,
  platform,
  onPlatformChange,
  platforms,
  total,
  counts,
  search,
  onSearchChange,
}: {
  status: StatusFilter;
  onStatusChange: (next: StatusFilter) => void;
  platform: Platform | "";
  onPlatformChange: (next: Platform | "") => void;
  platforms: Platform[];
  total: number;
  counts: Partial<Record<PostState, number>>;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <Segmented<StatusFilter>
        label="Filter by status"
        value={status}
        onValueChange={onStatusChange}
        options={[
          { value: "", label: "All", count: total },
          { value: "needs_approval", label: "Needs approval", count: counts.needs_approval ?? 0 },
          { value: "scheduled", label: "Scheduled", count: counts.scheduled ?? 0 },
          { value: "published", label: "Published", count: counts.published ?? 0 },
          { value: "failed", label: "Didn't go out", count: counts.failed ?? 0 },
          { value: "draft", label: "Drafts", count: counts.draft ?? 0 },
        ]}
      />

      <div className="flex items-center gap-2 max-[900px]:w-full">
        <PlatformFilterDropdown platform={platform} onChange={onPlatformChange} platforms={platforms} />

        <label className="relative w-64 max-[900px]:min-w-0 max-[900px]:flex-1">
          <span className="sr-only">Search posts</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search posts"
            className="h-10 w-full rounded-full bg-card pr-4 pl-10 text-sm ring-1 ring-border outline-none placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>
      </div>
    </div>
  );
}
