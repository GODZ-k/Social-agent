import { Suspense } from "react";
import { routes } from "@/config/routes";
import type { RouteSearchParams } from "@/lib/types";
import { safeRedirect } from "@/lib/auth/redirect";
import { ApprovalPanel } from "@/modules/auth/components/approval-panel";
import { AuthFormSkeleton } from "@/modules/auth/components/auth-form-skeleton";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { SwitchLink } from "@/modules/auth/components/switch-link";
import { VerifyEmailForm } from "@/modules/auth/components/verify-email-form";

export function VerifyPage({ searchParams }: { searchParams: RouteSearchParams }) {
  return (
    <AuthFrame
      top={<SwitchLink href={routes.auth.signIn} label="Back to sign in" />}
      panel={<ApprovalPanel />}
      promise="Nothing is published until you approve it."
    >
      <Suspense fallback={<AuthFormSkeleton fields={1} />}>
        <Verify searchParams={searchParams} />
      </Suspense>
    </AuthFrame>
  );
}

async function Verify({ searchParams }: { searchParams: RouteSearchParams }) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirect_url);
  return <VerifyEmailForm redirectTo={redirectTo} />;
}
