import { Search } from "lucide-react";
import type { PostStatus } from "@/lib/types";
import { Segmented } from "@repo/ui/components/segmented";

export type StatusFilter = "" | PostStatus;

export function ContentToolbar({
  status,
  onStatusChange,
  total,
  counts,
  search,
  onSearchChange,
}: {
  status: StatusFilter;
  onStatusChange: (next: StatusFilter) => void;
  total: number;
  counts: Partial<Record<PostStatus, number>>;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <Segmented<StatusFilter>
        label="Filter by status"
        value={status}
        onValueChange={onStatusChange}
        options={[
          { value: "", label: "All", count: total },
          { value: "in_review", label: "Needs approval", count: counts.in_review ?? 0 },
          { value: "scheduled", label: "Scheduled", count: counts.scheduled ?? 0 },
          { value: "published", label: "Published", count: counts.published ?? 0 },
          { value: "draft", label: "Drafts", count: counts.draft ?? 0 },
        ]}
      />
      <label className="relative ml-auto w-full sm:w-64">
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
  );
}
