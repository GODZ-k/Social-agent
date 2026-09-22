import { PageHeader } from "@repo/ui/components/states";

export default function CalendarLoading() {
  return (
    <>
      <PageHeader title="Calendar" description="What goes out and when. Open any post to change its time or wording." />
      <div className="grid gap-3" aria-busy aria-label="Loading">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton h-20 rounded-xl" />
        ))}
      </div>
    </>
  );
}
