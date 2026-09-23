# apps/web/features/content/posts-table.tsx

- SortState · type · L5-L5 — type SortState = false | "asc" | "desc";
- PostsTable · function · L8-L66 — function PostsTable({ table, onOpen }: { table: ContentTable; onOpen: (postId: string) => void })
- ariaSort · function · L68-L72 — function ariaSort(sorted: SortState): "ascending" | "descending" | "none"
- sortIcon · function · L75-L79 — function sortIcon(sorted: SortState)
- isRightAligned · function · L81-L83 — function isRightAligned(columnDef: { meta?: unknown }): boolean
