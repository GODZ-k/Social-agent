"use client";

import { useRouter } from "next/navigation";
import { TwoFactorSetupFlow } from "./two-factor-setup-flow";

/**
 * The setup flow as the `/two-factor/setup` page uses it: finishing sends the
 * person on to where they were headed. The page is a server component and cannot
 * hand a callback across the boundary, so the navigation is decided here.
 *
 * Reached when something requires two-factor rather than when someone chooses it:
 * an admin whose area is gated (`lib/auth/viewer.ts`), Clerk's own `setup-mfa`
 * session task, or the invite flow. Choosing to turn it on happens in the account
 * dialog instead.
 */
export function TwoFactorSetup({ lede, redirectTo, skip }: { lede: string; redirectTo: string; skip?: React.ReactNode }) {
  const router = useRouter();

  function done() {
    router.push(redirectTo);
    router.refresh();
  }

  return <TwoFactorSetupFlow lede={lede} onDone={done} skip={skip} headingLevel={1} />;
}
