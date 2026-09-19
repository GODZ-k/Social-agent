"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  useTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, LayoutGrid, LoaderCircle, Search, Sparkles } from "lucide-react";
import { postsQuery, strategyQuery, useGeneratePosts } from "@/lib/api/queries";
import { useWorkspace } from "@/hooks/use-workspace";
import type { BrandKit, Post, PostStatus } from "@/lib/types";
import { cn, formatCompact } from "@/lib/utils";
import { EmptyState, ErrorState, PageHeader, SkeletonRows } from "@/components/shell/states";
import { FORMAT_LABEL, PLATFORM_LABEL, PlatformIcon, StatusBadge } from "@/components/post/platform";
import { PostArt } from "@/components/post/post-art";
import { PostSheet } from "@/components/post/post-sheet";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";

/** A post plus the fields the table sorts and searches on. */
interface Row extends Post {
  pillarName: string;
  when: string | null;
  reach: number | null;
}

// Module scope: features and columns must be referentially stable between renders.
const features = tableFeatures({
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

const helper = createColumnHelper<typeof features, Row>();
const EMPTY: Row[] = [];

type StatusFilter = "" | PostStatus;

export default function ContentPage() {
  const { clientId, client } = useWorkspace();
  const posts = useQuery(postsQuery(clientId));
  const { data: strategy } = useQuery(strategyQuery(clientId));
  const generate = useGeneratePosts(clientId);

  const [status, setStatus] = useState<StatusFilter>("");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo<Row[]>(() => {
    if (!posts.data) return EMPTY;
    const names = new Map(strategy?.pillars.map((p) => [p.id, p.name]));
    return posts.data.map((p) => ({
      ...p,
      pillarName: names.get(p.pillarId) ?? "",
      when: p.publishedAt ?? p.scheduledFor,
      reach: p.metrics?.reach ?? null,
    }));
  }, [posts.data, strategy]);

  const brand = client?.brand;
  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("hook", {
          header: "Post",
          filterFn: "includesString",
          sortFn: "text",
          cell: ({ row }) => (
            <div className="flex items-center gap-3.5">
              {brand && <PostArt post={row.original} brand={brand} fixedAspect="aspect-square" className="w-11 shrink-0 rounded-md" />}
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
      ]),
    [brand],
  );

  const table = useTable({
    features,
    columns,
    data: rows,
    getRowId: (row) => row.id,
    globalFilterFn: "includesString",
    initialState: { pagination: { pageIndex: 0, pageSize: 10 }, sorting: [{ id: "when", desc: true }] },
  });

  const counts = useMemo(() => {
    const c: Partial<Record<PostStatus, number>> = {};
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  function changeStatus(next: StatusFilter) {
    setStatus(next);
    // An empty value removes the filter (built-in filter fns auto-remove on falsy).
    table.getColumn("status")?.setFilterValue(next);
    table.setPageIndex(0);
  }

  const visible = table.getRowModel().rows;
  const openPost = posts.data?.find((p) => p.id === openId) ?? null;
  const { pageIndex } = table.state.pagination;

  return (
    <>
      <PageHeader
        title="Content"
        description="Every post the agent has drafted for this client, from first draft to published."
        actions={
          <Button onClick={() => generate.mutate(6)} disabled={generate.isPending}>
            {generate.isPending ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
            {generate.isPending ? "Drafting 6 posts" : "Draft 6 more posts"}
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented<StatusFilter>
          label="Filter by status"
          value={status}
          onValueChange={changeStatus}
          options={[
            { value: "", label: "All", count: rows.length },
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
            value={String(table.state.globalFilter ?? "")}
            onChange={(e) => {
              table.setGlobalFilter(e.target.value);
              table.setPageIndex(0);
            }}
            placeholder="Search posts"
            className="h-10 w-full rounded-full bg-card pr-4 pl-10 text-sm ring-1 ring-border outline-none placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>
      </div>

      {posts.isPending && <SkeletonRows rows={6} />}
      {posts.error && <ErrorState error={posts.error} onRetry={() => posts.refetch()} />}

      {posts.data && visible.length === 0 && (
        <EmptyState
          icon={<LayoutGrid />}
          title={rows.length === 0 ? "No posts yet" : "No posts match"}
          description={
            rows.length === 0
              ? "The agent drafts posts from the strategy. Ask for a first batch and they'll appear here for approval."
              : "Try a different status or clear the search."
          }
          action={rows.length === 0 ? <Button onClick={() => generate.mutate(6)} disabled={generate.isPending}>Draft the first 6 posts</Button> : undefined}
        />
      )}

      {visible.length > 0 && (
        <>
          {/* Wide screens: a sortable table. */}
          <div className="hidden overflow-hidden rounded-xl bg-card shadow-raised md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                {table.getHeaderGroups().map((group) => (
                  <tr key={group.id} className="border-b">
                    {group.headers.map((header) => {
                      const sorted = header.column.getIsSorted();
                      const right = (header.column.columnDef.meta as { align?: string } | undefined)?.align === "right";
                      return (
                        <th
                          key={header.id}
                          scope="col"
                          aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"}
                          className={cn("px-5 py-3 font-medium text-muted-foreground", right ? "text-right" : "text-left")}
                        >
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn("inline-flex items-center gap-1 rounded-sm hover:text-foreground", sorted && "text-foreground")}
                          >
                            <table.FlexRender header={header} />
                            {sorted === "asc" ? <ArrowUp className="size-3.5" /> : sorted === "desc" ? <ArrowDown className="size-3.5" /> : <span className="size-3.5" />}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setOpenId(row.id)}
                    className="cursor-pointer border-b transition-colors last:border-0 hover:bg-tint/60 active:bg-tint"
                  >
                    {row.getAllCells().map((cell, i) => (
                      <td
                        key={cell.id}
                        className={cn("px-5 py-3", i === 0 && "w-[38%] max-w-0", (cell.column.columnDef.meta as { align?: string } | undefined)?.align === "right" && "text-right")}
                      >
                        {i === 0 ? (
                          // The row is clickable for pointers; this button makes it reachable by keyboard.
                          <button type="button" className="block w-full rounded-md text-left" onClick={(e) => { e.stopPropagation(); setOpenId(row.id); }}>
                            <table.FlexRender cell={cell} />
                          </button>
                        ) : (
                          <table.FlexRender cell={cell} />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phones: the same rows, sorted and filtered by the same table, as cards. */}
          <ul className="grid gap-2.5 md:hidden">
            {visible.map(({ original: post }) => (
              <li key={post.id}>
                <button type="button" onClick={() => setOpenId(post.id)} className="pressable flex w-full items-center gap-3.5 rounded-xl bg-card p-3 text-left shadow-raised">
                  {brand && <PostArt post={post} brand={brand} fixedAspect="aspect-square" className="w-16 shrink-0" />}
                  <span className="grid min-w-0 flex-1 gap-1">
                    <span className="truncate font-medium">{post.hook}</span>
                    <span className="type-label flex items-center gap-1.5">
                      <PlatformIcon platform={post.platform} className="size-3.5" />
                      {post.when ? format(new Date(post.when), "d MMM, h:mm a") : "No date"}
                    </span>
                    <StatusBadge status={post.status} />
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <Pagination
            page={pageIndex + 1}
            pages={table.getPageCount()}
            total={table.getPrePaginatedRowModel().rows.length}
            onPrev={table.getCanPreviousPage() ? () => table.previousPage() : undefined}
            onNext={table.getCanNextPage() ? () => table.nextPage() : undefined}
          />
        </>
      )}

      <PostSheet post={openPost} brand={brand as BrandKit | undefined} clientId={clientId} onClose={() => setOpenId(null)} />
    </>
  );
}

function Pagination({ page, pages, total, onPrev, onNext }: { page: number; pages: number; total: number; onPrev?: () => void; onNext?: () => void }) {
  if (pages <= 1) return <p className="type-label mt-4 tabular-nums">{total} {total === 1 ? "post" : "posts"}</p>;
  return (
    <nav aria-label="Pages" className="mt-4 flex items-center justify-between gap-4">
      <p className="type-label tabular-nums">Page {page} of {pages}, {total} posts</p>
      <div className="flex gap-1.5">
        <Button variant="outline" size="icon-sm" onClick={onPrev} disabled={!onPrev} aria-label="Previous page"><ChevronLeft /></Button>
        <Button variant="outline" size="icon-sm" onClick={onNext} disabled={!onNext} aria-label="Next page"><ChevronRight /></Button>
      </div>
    </nav>
  );
}
