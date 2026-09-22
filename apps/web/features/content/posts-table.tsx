import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentTable } from "./columns";

type SortState = false | "asc" | "desc";

/** Wide screens: a sortable table. */
export function PostsTable({ table, onOpen }: { table: ContentTable; onOpen: (postId: string) => void }) {
  return (
    <div className="hidden overflow-hidden rounded-xl bg-card shadow-raised md:block">
      <table className="w-full border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id} className="border-b">
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted() as SortState;
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={ariaSort(sorted)}
                    className={cn("px-5 py-3 font-medium text-muted-foreground", isRightAligned(header.column.columnDef) ? "text-right" : "text-left")}
                  >
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className={cn("inline-flex items-center gap-1 rounded-sm hover:text-foreground", sorted && "text-foreground")}
                    >
                      <table.FlexRender header={header} />
                      {sortIcon(sorted)}
                    </button>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onOpen(row.id)}
              className="cursor-pointer border-b transition-colors last:border-0 hover:bg-tint/60 active:bg-tint"
            >
              {row.getAllCells().map((cell, i) => (
                <td
                  key={cell.id}
                  className={cn("px-5 py-3", i === 0 && "w-[38%] max-w-0", isRightAligned(cell.column.columnDef) && "text-right")}
                >
                  {i === 0 ? (
                    // The row is clickable for pointers; this button makes it reachable by keyboard.
                    <button type="button" className="block w-full rounded-md text-left" onClick={(e) => { e.stopPropagation(); onOpen(row.id); }}>
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
  );
}

function ariaSort(sorted: SortState): "ascending" | "descending" | "none" {
  if (sorted === "asc") return "ascending";
  if (sorted === "desc") return "descending";
  return "none";
}

/** The blank span keeps the header from shifting when a column is unsorted. */
function sortIcon(sorted: SortState) {
  if (sorted === "asc") return <ArrowUp className="size-3.5" />;
  if (sorted === "desc") return <ArrowDown className="size-3.5" />;
  return <span className="size-3.5" />;
}

function isRightAligned(columnDef: { meta?: unknown }): boolean {
  return (columnDef.meta as { align?: string } | undefined)?.align === "right";
}
