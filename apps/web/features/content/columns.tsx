import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equalsString,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  type ReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import type { BrandKit } from "@/lib/types";
import { formatCompact } from "@/lib/utils";
import { FORMAT_LABEL, PLATFORM_LABEL, PlatformIcon, StatusBadge } from "@repo/ui/components/social/platform";
import { PostArt } from "@repo/ui/components/social/post-art";
import type { Row } from "./use-post-rows";

// Module scope: features and the helper must be referentially stable between renders.
export const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString, equalsString: filterFn_equalsString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, basic: sortFn_basic },
});

export const helper = createColumnHelper<typeof features, Row>();

export type ContentTable = ReactTable<typeof features, Row>;

export function buildColumns(brand: BrandKit) {
  return helper.columns([
    helper.accessor("hook", {
      header: "Post",
      filterFn: "includesString",
      sortFn: "text",
      cell: ({ row }) => (
        <div className="flex items-center gap-3.5">
          <PostArt post={row.original} brand={brand} fixedAspect="aspect-square" className="w-11 shrink-0 rounded-md" />
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.hook}</p>
            <p className="type-label truncate">{row.original.pillarName}</p>
          </div>
        </div>
      ),
    }),
    helper.accessor("platform", {
      header: "Platform",
      sortFn: "text",
      cell: ({ row }) => (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <PlatformIcon platform={row.original.platform} className="text-muted-foreground" />
          {PLATFORM_LABEL[row.original.platform]}
          <span className="text-muted-foreground">{FORMAT_LABEL[row.original.format].toLowerCase()}</span>
        </span>
      ),
    }),
    helper.accessor("status", {
      header: "Status",
      filterFn: "equalsString",
      sortFn: "text",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    }),
    helper.accessor("when", {
      header: "Date",
      sortFn: "basic",
      sortUndefined: "last",
      cell: ({ getValue }) => {
        const v = getValue();
        return <span className="whitespace-nowrap tabular-nums">{v ? format(new Date(v), "d MMM, h:mm a") : "Not set"}</span>;
      },
    }),
    helper.accessor("reach", {
      header: "Reach",
      sortFn: "basic",
      sortUndefined: "last",
      sortDescFirst: true,
      meta: { align: "right" },
      cell: ({ getValue }) => {
        const v = getValue();
        return <span className="tabular-nums">{v === null ? <span className="text-muted-foreground">–</span> : formatCompact(v)}</span>;
      },
    }),
  ]);
}
