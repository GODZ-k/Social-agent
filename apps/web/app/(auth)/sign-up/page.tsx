import { Suspense } from "react";
import type { Metadata } from "next";
import { safeRedirect } from "@/lib/auth/redirect";
import { normalizeUrl } from "@/lib/utils";
import { ApprovalPanel } from "@/components/auth/approval-panel";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { AuthFrame } from "@/components/auth/auth-frame";
import { SwitchLink } from "@/components/auth/switch-link";
import { SignUpForm } from "@/features/auth/sign-up-form";
import { SiteCarry } from "@/features/auth/site-carry";

export const metadata: Metadata = { title: "Create your account" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Same shape as sign-in: everything but the form itself is known ahead of the request. */
export default function SignUpPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <AuthFrame
      top={<SwitchLink prompt="Have an account?" href="/sign-in" label="Sign in" />}
      panel={<ApprovalPanel />}
      promise="Nothing is published until you approve it."
    >
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <SignUp searchParams={searchParams} />
      </Suspense>
    </AuthFrame>
  );
}

async function SignUp({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const site = typeof params.url === "string" ? normalizeUrl(params.url) : null;
  const fallback = site ? `/onboarding?url=${encodeURIComponent(site)}` : "/";
  const redirectTo = safeRedirect(params.redirect_url, fallback);
  return <SignUpForm redirectTo={redirectTo} site={site ? <SiteCarry url={site} /> : null} />;
}
