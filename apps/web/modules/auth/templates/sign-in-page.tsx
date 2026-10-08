import { Suspense } from "react";
import { routes } from "@/config/routes";
import type { RouteSearchParams } from "@/lib/types";
import { safeRedirect, withRedirect } from "@/lib/auth/redirect";
import { APP_NAME } from "@/lib/utils";
import { ApprovalPanel } from "@/modules/auth/components/approval-panel";
import { AuthFormSkeleton } from "@/modules/auth/components/auth-form-skeleton";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { SwitchLink } from "@/modules/auth/components/switch-link";
import { SignInForm } from "@/modules/auth/components/sign-in-form";

/**
 * The frame, the brand panel and the promise carry no request data, so they
 * prerender: this is the page everyone lands on, and it paints before the two
 * pieces below know where sign-in should return to.
 */
export function SignInPage({ searchParams }: { searchParams: RouteSearchParams }) {
  return (
    <AuthFrame
      top={
        <Suspense fallback={<SwitchLink prompt={`New to ${APP_NAME}?`} href={routes.auth.signUp} label="Create an account" />}>
          <SignUpSwitch searchParams={searchParams} />
        </Suspense>
      }
      panel={<ApprovalPanel />}
      promise="Nothing is published until you approve it."
    >
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <SignIn searchParams={searchParams} />
      </Suspense>
    </AuthFrame>
  );
}

async function SignUpSwitch({ searchParams }: { searchParams: RouteSearchParams }) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirect_url);
  const signUpHref = withRedirect(routes.auth.signUp, redirectTo);
  return <SwitchLink prompt={`New to ${APP_NAME}?`} href={signUpHref} label="Create an account" />;
}

async function SignIn({ searchParams }: { searchParams: RouteSearchParams }) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirect_url);
  return <SignInForm redirectTo={redirectTo} sessionEnded={params.reason === "session-ended"} />;
}
