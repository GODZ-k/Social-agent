import { Panel } from "@repo/ui/components/states";

/** One stat card: a label, an optional sparkline, the number, and a delta row underneath. */
export function StatTile({
  label,
  value,
  spark,
  children,
}: {
  label: string;
  value: React.ReactNode;
  spark?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Panel className="p-4 md:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="type-label">{label}</p>
        {spark}
      </div>
      <p className="type-number mt-1.5 text-2xl">{value}</p>
      {children && <div className="type-label mt-1.5 flex flex-wrap items-center gap-1.5">{children}</div>}
    </Panel>
  );
}
