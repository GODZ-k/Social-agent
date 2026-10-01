/**
 * The number a panel leads with and a caption naming what it counts. Goes in
 * `PanelHeader`'s `right` slot, and lives beside it so neither feature that uses
 * it has to import from the other.
 */
export function PanelStat({ value, caption }: { value: React.ReactNode; caption?: string }) {
  return (
    <div className="shrink-0 text-right">
      <p className="type-number text-xl">{value}</p>
      {caption && <p className="type-label mt-0.5">{caption}</p>}
    </div>
  );
}
