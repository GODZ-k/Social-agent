/**
 * One line of the account dialog: what it is on the left, what it says in the
 * middle, what you can do about it on the right. Clerk's profile is built from
 * this shape, and it is why the dialog holds no cards of its own — the dialog is
 * already the card.
 */
export function AccountRow({
  label,
  children,
  action,
}: {
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start gap-x-4 gap-y-2 py-4 sm:flex-nowrap">
      <p className="type-label w-full shrink-0 pt-0.5 text-muted-foreground sm:w-44">{label}</p>
      <div className="min-w-0 flex-1">{children}</div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

/** A titled group of rows, hairline-separated, the way each of Clerk's profile sections reads. */
export function AccountSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border py-2 last:border-b-0">
      <h3 className="type-heading pt-4">{title}</h3>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}
