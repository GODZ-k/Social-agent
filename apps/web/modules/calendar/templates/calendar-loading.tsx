import { PageHeader, Panel } from "@repo/ui/components/states";

/**
 * Mirrors `CalendarView`: the month nav and legend, then the grid on `lg` and up (the same
 * breakpoint `MonthGrid`/`AgendaList` collapse on) or the day-by-day agenda below it (ST-3,
 * built alongside overview/content/approvals for the same quality bar).
 */
export default function CalendarLoading() {
  return (
    <>
      <PageHeader
        title="Calendar"
        description="What goes out and when. Open any post to change its time or wording."
        actions={<div className="skeleton h-9 w-40 rounded-full" />}
      />

      <Panel aria-busy aria-label="Loading calendar">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <div className="skeleton h-5.5 w-36" />
          <div className="flex items-center gap-1.5">
            <div className="skeleton h-8.5 w-16 rounded-full" />
            <div className="skeleton size-8.5 rounded-full" />
            <div className="skeleton size-8.5 rounded-full" />
          </div>
        </div>
        <div className="mb-2 hidden flex-wrap gap-x-4 gap-y-1.5 md:flex">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton h-3 w-24" />
          ))}
        </div>
        <div className="skeleton mb-4 h-4 w-80 max-w-full" />

        {/* Grid: `lg` and up. */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-7 border-b">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="skeleton mx-3 my-2.5 h-3 w-8" />
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className={`min-h-28 border-b p-1.5 ${i % 7 !== 6 ? "border-r" : ""}`}>
                <div className="skeleton ml-auto size-6 rounded-full" style={{ animationDelay: `${(i % 7) * 60}ms` }} />
                {i % 3 === 0 && <div className="skeleton mt-6 h-7 rounded-lg" />}
              </div>
            ))}
          </div>
        </div>

        {/* Agenda: below `lg`. */}
        <ol className="grid gap-5 lg:hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="grid grid-cols-[3rem_1fr] gap-3">
              <div className="grid justify-items-center gap-1.5 pt-1">
                <div className="skeleton h-3 w-6" />
                <div className="skeleton size-9 rounded-full" />
              </div>
              <div className="skeleton h-16 rounded-xl" style={{ animationDelay: `${i * 60}ms` }} />
            </li>
          ))}
        </ol>
      </Panel>
    </>
  );
}
