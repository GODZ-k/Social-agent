import { Suspense } from "react";
import { routes } from "@/config/routes";
import type { RouteSearchParams } from "@/lib/types";
import { safeRedirect } from "@/lib/auth/redirect";
import { AuthFormSkeleton } from "@/modules/auth/components/auth-form-skeleton";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { SwitchLink } from "@/modules/auth/components/switch-link";
import { TwoFactorPanel } from "@/modules/auth/components/two-factor-panel";
import { TwoFactorSignIn } from "@/modules/auth/components/two-factor-sign-in";

export function TwoFactorPage({ searchParams }: { searchParams: RouteSearchParams }) {
  // AUTH-7's approved copy is written for the admin who must set two-factor up; a client's
  // optional two-factor needs its own words (DESIGN_TRACKER 5, "Auth") once client role is
  // known at this step.
  const panel = (
    <TwoFactorPanel
      heading="Admin accounts open every client's brand."
      body="So they need a second step at sign-in. A stolen password alone can't get in."
    />
  );
  return (
    <AuthFrame
      top={<SwitchLink href={routes.auth.signIn} label="Use a different account" />}
      panel={panel}
      promise="Admin accounts always sign in with two steps."
    >
      <Suspense fallback={<AuthFormSkeleton fields={1} />}>
        <TwoFactor searchParams={searchParams} />
      </Suspense>
    </AuthFrame>
  );
}

async function TwoFactor({ searchParams }: { searchParams: RouteSearchParams }) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirect_url);
  return <TwoFactorSignIn redirectTo={redirectTo} />;
}
