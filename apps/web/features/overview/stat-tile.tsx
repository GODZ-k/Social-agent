/** One tile's frame. Callers compose the secondary line, since each tile's meaning differs. */
export function StatTile({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-raised md:p-5">
      <dt className="type-label">{label}</dt>
      <dd className="mt-1">
        {value && <span className="type-number text-[1.75rem] leading-none md:text-[2rem]">{value}</span>}
        <div className="mt-1 text-[0.8125rem] tabular-nums">{children}</div>
      </dd>
    </div>
  );
}
