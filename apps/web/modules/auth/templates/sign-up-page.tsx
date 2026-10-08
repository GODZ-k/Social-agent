import { Suspense } from "react";
import { routes } from "@/config/routes";
import type { RouteSearchParams } from "@/lib/types";
import { safeRedirect } from "@/lib/auth/redirect";
import { normalizeUrl } from "@/lib/utils";
import { ApprovalPanel } from "@/modules/auth/components/approval-panel";
import { AuthFormSkeleton } from "@/modules/auth/components/auth-form-skeleton";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { SwitchLink } from "@/modules/auth/components/switch-link";
import { SignUpForm } from "@/modules/auth/components/sign-up-form";
import { SiteCarry } from "@/modules/auth/components/site-carry";

/** Same shape as sign-in: everything but the form itself is known ahead of the request. */
export function SignUpPage({ searchParams }: { searchParams: RouteSearchParams }) {
  return (
    <AuthFrame
      top={<SwitchLink prompt="Have an account?" href={routes.auth.signIn} label="Sign in" />}
      panel={<ApprovalPanel />}
      promise="Nothing is published until you approve it."
    >
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <SignUp searchParams={searchParams} />
      </Suspense>
    </AuthFrame>
  );
}

async function SignUp({ searchParams }: { searchParams: RouteSearchParams }) {
  const params = await searchParams;
  const site = typeof params.url === "string" ? normalizeUrl(params.url) : null;
  const fallback = site ? routes.onboarding.forUrl(site) : routes.home;
  const redirectTo = safeRedirect(params.redirect_url, fallback);
  return <SignUpForm redirectTo={redirectTo} site={site ? <SiteCarry url={site} /> : null} />;
}
