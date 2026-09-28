import type { Metadata } from "next";
import { safeRedirect } from "@/lib/auth/redirect";
import { AuthFrame } from "@/components/auth/auth-frame";
import { SwitchLink } from "@/components/auth/switch-link";
import { TwoFactorPanel } from "@/components/auth/two-factor-panel";
import { TwoFactorSignIn } from "@/features/auth/two-factor-sign-in";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "Two-factor code" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function TwoFactorPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirect_url);
  // AUTH-7's approved copy is written for the admin who must set two-factor up; a client's
  // optional two-factor needs its own words (DESIGN_TRACKER 5, "Auth") once client role is
  // known at this step.
  const panel = <TwoFactorPanel heading="Admin accounts open every client's brand." body="So they need a second step at sign-in. A stolen password alone can't get in." />;
  return (
    <AuthFrame top={<SwitchLink href="/sign-in" label="Use a different account" />} panel={panel} promise="Admin accounts always sign in with two steps.">
      <TwoFactorSignIn redirectTo={redirectTo} />
    </AuthFrame>
  );
}
