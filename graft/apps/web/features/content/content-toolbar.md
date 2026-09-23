# apps/web/features/content/content-toolbar.tsx

- StatusFilter · type · L5-L5 — type StatusFilter = "" | PostStatus;
- ContentToolbar · function · L7-L49 — function ContentToolbar({ status, onStatusChange, total, counts, search, onSearchChange, }: { status: StatusFilter; onStatusChange: (next: StatusFilter) => void; total: number; counts: Partial<Record<PostStatus, number>>; search: string; onSearchChange: (value: string) => void; })
