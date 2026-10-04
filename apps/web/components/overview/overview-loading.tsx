import { Panel } from "@repo/ui/components/states";

export default function OverviewLoading() {
  return (
    <div className="grid gap-5" aria-busy aria-label="Loading brand">
      <header className="mb-2 flex flex-wrap items-start justify-between gap-x-6 gap-y-4 sm:flex-nowrap">
        <div className="grid gap-2.5">
          <div className="skeleton h-9 w-64 max-w-[70vw] rounded-lg" />
          <div className="skeleton h-5 w-80 max-w-[60vw]" />
        </div>
        <div className="skeleton h-8.5 w-40 shrink-0 rounded-full" />
      </header>

      {/* Next step: the tint banner's text on the left, its actions on the right. */}
      <section className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4 rounded-xl bg-tint p-5 md:p-6">
        <div className="grid min-w-56 gap-2.5">
          <div className="skeleton h-5.5 w-64 max-w-full rounded-md bg-tint-strong" />
          <div className="skeleton h-4 w-80 max-w-full rounded-md bg-tint-strong" />
        </div>
        <div className="flex flex-wrap gap-2.5">
          <div className="skeleton h-11 w-36 rounded-full bg-tint-strong" />
          <div className="skeleton h-11 w-32 rounded-full bg-tint-strong" />
        </div>
      </section>

      {/* Where the agent is: heading, subtitle, then the loop's six named stops. */}
      <Panel>
        <div className="skeleton h-5 w-44 rounded-md" />
        <div className="skeleton mt-2 mb-5 h-4 w-72 max-w-full" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="grid gap-2" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="skeleton h-1.5 w-full rounded-full" />
              <div className="skeleton h-3 w-4/5" />
            </div>
          ))}
        </div>
      </Panel>

      {/* This week: same frame as ThisWeekPanelSkeleton, matched here since the outer loading
          boundary resolves before that panel's own Suspense ever mounts. */}
      <Panel className="overflow-hidden">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="grid gap-2">
            <div className="skeleton h-5 w-24 rounded-md" />
          </div>
          <div className="skeleton h-8.5 w-40 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-7">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-xl bg-card p-4 shadow-raised md:p-5">
            <div className="skeleton h-3.5 w-24" />
            <div className="skeleton mt-2.5 h-8 w-16 rounded-md" />
            <div className="skeleton mt-2 h-3.5 w-28" />
          </div>
        ))}
      </div>

      {/* Brand kit: the summary text and voice tags on the left, colours and fonts on the right. */}
      <Panel>
        <div className="skeleton h-5 w-24 rounded-md" />
        <div className="skeleton mt-2 mb-5 h-4 w-56" />
        <div className="grid gap-7 lg:grid-cols-[1.3fr_1fr]">
          <div className="grid gap-2">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-4/5" />
            <div className="mt-3 flex flex-wrap gap-1.5">
              <div className="skeleton h-6 w-20 rounded-full" />
              <div className="skeleton h-6 w-24 rounded-full" />
              <div className="skeleton h-6 w-16 rounded-full" />
            </div>
          </div>
          <div className="grid gap-3">
            <div className="skeleton h-16 rounded-lg" />
            <div className="skeleton h-3.5 w-32" />
          </div>
        </div>
      </Panel>
    </div>
  );
}
