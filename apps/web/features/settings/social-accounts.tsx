import type { SocialAccountRow } from "@/lib/types";
import { AccountRow } from "@/features/settings/account-row";
import { AccountsWaitingBanner } from "@/features/settings/accounts-waiting-banner";
import { ConnectionPromisePanel } from "@/features/settings/connection-promise-panel";

/** Grouped by the posting plan (owner decision, S14): planned platforms first, since publishing depends on them. */
export function SocialAccounts({ brandId, accounts }: { brandId: string; accounts: SocialAccountRow[] }) {
  const planned = accounts.filter((a) => a.inPlan);
  const unplanned = accounts.filter((a) => !a.inPlan);

  return (
    <div className="grid max-w-3xl gap-3">
      <AccountsWaitingBanner accounts={accounts} />

      {planned.length > 0 && (
        <>
          <p className="mt-1 text-sm font-semibold">In your posting plan</p>
          <ul className="grid gap-3">
            {planned.map((account) => (
              <AccountRow key={account.platform} brandId={brandId} account={account} />
            ))}
          </ul>
        </>
      )}

      {unplanned.length > 0 && (
        <>
          <p className="mt-1 text-sm font-semibold">Not in your plan</p>
          <ul className="grid gap-3">
            {unplanned.map((account) => (
              <AccountRow key={account.platform} brandId={brandId} account={account} />
            ))}
          </ul>
        </>
      )}

      <ConnectionPromisePanel />
    </div>
  );
}
