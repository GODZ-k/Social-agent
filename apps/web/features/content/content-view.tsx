"use client";

import { useMemo, useState } from "react";
import { useTable } from "@tanstack/react-table";
import { LayoutGrid } from "lucide-react";
import type { BrandKit, PostStatus } from "@social-agent/shared";
import type { Post, Strategy } from "@/lib/types";
import { EmptyState } from "@repo/ui/components/states";
import { LazyPostSheet } from "@/features/post/lazy-post-sheet";
import { buildColumns, features } from "./columns";
import { ContentToolbar, type StatusFilter } from "./content-toolbar";
import { Pagination } from "./pagination";
import { PostsCards } from "./posts-cards";
import { PostsTable } from "./posts-table";
import { usePostRows } from "./use-post-rows";

/** `children` is the button that drafts the first batch, shown when the client has no posts. */
export function ContentView({
  posts,
  strategy,
  brand,
  children,
}: {
  posts: Post[];
  strategy: Strategy | null;
  brand: BrandKit;
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<StatusFilter>("");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = usePostRows(posts, strategy);
  const columns = useMemo(() => buildColumns(brand), [brand]);

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

  function changeSearch(value: string) {
    table.setGlobalFilter(value);
    table.setPageIndex(0);
  }

  const visible = table.getRowModel().rows;
  const openPost = posts.find((p) => p.id === openId) ?? null;
  const { pageIndex } = table.state.pagination;

  return (
    <>
      <ContentToolbar
        status={status}
        onStatusChange={changeStatus}
        total={rows.length}
        counts={counts}
        search={String(table.state.globalFilter ?? "")}
        onSearchChange={changeSearch}
      />

      {visible.length === 0 && (
        <EmptyState
          icon={<LayoutGrid />}
          title={rows.length === 0 ? "No posts yet" : "No posts match"}
          description={
            rows.length === 0
              ? "The agent drafts posts from the strategy. Ask for a first batch and they'll appear here for approval."
              : "Try a different status or clear the search."
          }
          action={rows.length === 0 ? children : undefined}
        />
      )}

      {visible.length > 0 && (
        <>
          <PostsTable table={table} onOpen={setOpenId} />
          <PostsCards posts={visible.map((row) => row.original)} brand={brand} onOpen={setOpenId} />
          <Pagination
            page={pageIndex + 1}
            pages={table.getPageCount()}
            total={table.getPrePaginatedRowModel().rows.length}
            onPrev={table.getCanPreviousPage() ? () => table.previousPage() : undefined}
            onNext={table.getCanNextPage() ? () => table.nextPage() : undefined}
          />
        </>
      )}

      <LazyPostSheet post={openPost} brand={brand} strategy={strategy} onClose={() => setOpenId(null)} />
    </>
  );
}
