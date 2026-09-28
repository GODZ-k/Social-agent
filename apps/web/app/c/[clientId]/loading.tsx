/**
 * Mirrors the overview page block by block (title, next step, loop, this
 * week, stat tiles, brand kit) so the real content lands in place instead of
 * jumping. Other workspace pages carry their own loading file.
 */
export default function WorkspaceLoading() {
  return (
    <div className="grid gap-5" aria-busy aria-label="Loading client">
      <div className="mb-2 flex items-end justify-between gap-6">
        <div className="grid gap-3">
          <div className="skeleton h-10 w-64 rounded-lg" />
          <div className="skeleton h-5 w-96 max-w-full" />
        </div>
        <div className="skeleton h-9 w-36 shrink-0 rounded-full" />
      </div>

      <div className="skeleton h-[6.25rem] rounded-xl" />

      <div className="skeleton h-[9.75rem] rounded-xl" />

      <div className="rounded-xl bg-card p-5 shadow-raised md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="skeleton h-6 w-36" />
          <div className="skeleton h-8 w-32 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-7">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="skeleton h-24 rounded-lg" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton h-[7.375rem] rounded-xl" />
        ))}
      </div>

      <div className="skeleton h-[14.75rem] rounded-xl" />
    </div>
  );
}
