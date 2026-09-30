import { AccountRow, AccountSection } from "./account-row";

/**
 * What the account dialog shows while its one read is in flight.
 *
 * Everything already known is drawn for real — the section headings and the row
 * labels are fixed copy, and so is the shape of every row — so only the values
 * pulse. It is built from the same `AccountSection` and `AccountRow` as the real
 * panes, which is what keeps the two the same height: nothing moves when the
 * data lands, it just fills in.
 */

/** A line of text that hasn't arrived. Rounded like the type it stands in for. */
function TextBar({ className }: { className: string }) {
  return <div className={`skeleton h-4 rounded-full ${className}`} />;
}

/** A button that hasn't arrived, at `Button size="sm"`'s own height. */
function ButtonShape({ className }: { className: string }) {
  return <div className={`skeleton h-8.5 rounded-full ${className}`} />;
}

export function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading your account">
      <AccountSection title="Profile">
        <AccountRow label="Name" action={<ButtonShape className="w-14" />}>
          <div className="flex items-center gap-3">
            <div className="skeleton size-9 shrink-0 rounded-full" />
            <TextBar className="w-36" />
          </div>
        </AccountRow>
        <AccountRow label="Email address">
          <TextBar className="w-64 max-w-full" />
          <TextBar className="mt-2 w-44 max-w-full" />
        </AccountRow>
      </AccountSection>
    </div>
  );
}

export function SecuritySkeleton() {
  return (
    <div role="status" aria-label="Loading your account">
      <AccountSection title="Password">
        <AccountRow label="Password" action={<ButtonShape className="w-36" />}>
          <TextBar className="w-40" />
          <TextBar className="mt-2 w-56 max-w-full" />
        </AccountRow>
      </AccountSection>

      <AccountSection title="Two-factor sign-in">
        <AccountRow label="Two-factor" action={<ButtonShape className="w-20" />}>
          <TextBar className="w-12" />
          <TextBar className="mt-2 w-60 max-w-full" />
        </AccountRow>
      </AccountSection>

      <AccountSection title="Where you're signed in">
        <ul className="divide-y divide-border py-1">
          {/* Three: the most common number of devices, and enough to read as a list. */}
          {[0, 1, 2].map((row) => (
            <li key={row} className="flex items-center gap-3 py-3">
              <div className="skeleton size-9 shrink-0 rounded-[0.75rem]" />
              <div className="min-w-0 flex-1">
                <TextBar className="w-44 max-w-full" />
                <TextBar className="mt-2 w-56 max-w-full" />
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-3.5">
          <TextBar className="w-72 max-w-full" />
          <ButtonShape className="w-44" />
        </div>
      </AccountSection>
    </div>
  );
}
