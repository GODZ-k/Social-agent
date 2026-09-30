import { Suspense } from "react";
import type { Metadata } from "next";
import { safeRedirect, withRedirect } from "@/lib/auth/redirect";
import { APP_NAME } from "@/lib/utils";
import { ApprovalPanel } from "@/components/auth/approval-panel";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { AuthFrame } from "@/components/auth/auth-frame";
import { SwitchLink } from "@/components/auth/switch-link";
import { SignInForm } from "@/features/auth/sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * The frame, the brand panel and the promise carry no request data, so they
 * prerender: this is the page everyone lands on, and it paints before the two
 * pieces below know where sign-in should return to.
 */
export default function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <AuthFrame
      top={
        <Suspense fallback={<SwitchLink prompt={`New to ${APP_NAME}?`} href="/sign-up" label="Create an account" />}>
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

async function SignUpSwitch({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirect_url);
  const signUpHref = withRedirect("/sign-up", redirectTo);
  return <SwitchLink prompt={`New to ${APP_NAME}?`} href={signUpHref} label="Create an account" />;
}

async function SignIn({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirect_url);
  return <SignInForm redirectTo={redirectTo} sessionEnded={params.reason === "session-ended"} />;
}
