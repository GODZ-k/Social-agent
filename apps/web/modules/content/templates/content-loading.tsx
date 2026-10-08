import { PageHeader } from "@repo/ui/components/states";

/**
 * Mirrors the content page: the toolbar's filters and search, then the table (cards below
 * `lg`, this repo's collapse breakpoint for loading skeletons) with the same five columns
 * as `ContentTable` (ST-3 "content").
 */
export default function ContentLoading() {
  return (
    <>
      <PageHeader title="Content" description="Every post the agent drafted, from first draft to published." actions={<div className="skeleton h-9 w-36 rounded-full" />} />

      <div aria-busy aria-label="Loading posts">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="skeleton h-9 w-full max-w-96 rounded-full" />
          <div className="flex items-center gap-2 max-lg:w-full">
            <div className="skeleton h-9 w-36 shrink-0 rounded-full" />
            <div className="skeleton h-10 w-full max-w-64 rounded-full lg:w-64" />
          </div>
        </div>

        {/* Table: `lg` and up. */}
        <div className="hidden overflow-hidden rounded-xl bg-card shadow-raised lg:block">
          <div className="grid grid-cols-[2.3fr_1.6fr_1fr_1.2fr_5.5rem] items-center gap-5 border-b px-5 py-3">
            {["Post", "Where it goes", "Status", "Goes out", ""].map((label) => (
              <span key={label} className="text-sm font-medium text-muted-foreground">
                {label}
              </span>
            ))}
          </div>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="grid grid-cols-[2.3fr_1.6fr_1fr_1.2fr_5.5rem] items-center gap-5 border-b px-5 py-3 last:border-0">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="skeleton size-11 shrink-0 rounded-md" style={{ animationDelay: `${i * 60}ms` }} />
                <div className="grid min-w-0 flex-1 gap-1.5">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-2/5" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="skeleton size-4 rounded-full" />
                <div className="skeleton h-3.5 w-32" />
              </div>
              <div className="skeleton h-6 w-28 rounded-full" />
              <div className="grid gap-1">
                <div className="skeleton h-3.5 w-28" />
                <div className="skeleton h-3 w-16" />
              </div>
              <div className="skeleton h-8.5 w-19 justify-self-end rounded-full" />
            </div>
          ))}
        </div>

        {/* Cards: below `lg`. */}
        <ul className="grid gap-2.5 lg:hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-raised">
              <div className="skeleton size-14 shrink-0 rounded-lg" style={{ animationDelay: `${i * 60}ms` }} />
              <div className="grid min-w-0 flex-1 gap-1.5">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-2/5" />
                <div className="skeleton h-5 w-24 rounded-full" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
