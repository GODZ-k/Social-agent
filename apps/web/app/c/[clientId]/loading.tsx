/**
 * Mirrors the overview page block by block (title, next step, loop, four
 * metrics, upcoming posts, brand kit) so the real content lands in place
 * instead of jumping. Other workspace pages carry their own loading file.
 */
export default function WorkspaceLoading() {
  return (
    <div className="grid gap-5" aria-busy aria-label="Loading client">
      <div className="mb-2 grid gap-3">
        <div className="skeleton h-10 w-64 rounded-lg" />
        <div className="skeleton h-5 w-96 max-w-full" />
      </div>

      <div className="skeleton h-[6.25rem] rounded-xl" />

      <div className="skeleton h-[9.75rem] rounded-xl" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton h-[7.375rem] rounded-xl" />
        ))}
      </div>

      <div className="rounded-xl bg-card p-5 shadow-raised md:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="skeleton h-6 w-36" />
          <div className="skeleton h-8 w-32 rounded-full" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton aspect-[4/5] w-40 shrink-0 rounded-lg" />
          ))}
        </div>
      </div>

      <div className="skeleton h-[14.75rem] rounded-xl" />
    </div>
  );
}
