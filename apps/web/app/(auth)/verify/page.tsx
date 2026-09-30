import { Suspense } from "react";
import type { Metadata } from "next";
import { safeRedirect } from "@/lib/auth/redirect";
import { ApprovalPanel } from "@/components/auth/approval-panel";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { AuthFrame } from "@/components/auth/auth-frame";
import { SwitchLink } from "@/components/auth/switch-link";
import { VerifyEmailForm } from "@/features/auth/verify-email-form";

export const metadata: Metadata = { title: "Verify your email" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function VerifyPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <AuthFrame
      top={<SwitchLink href="/sign-in" label="Back to sign in" />}
      panel={<ApprovalPanel />}
      promise="Nothing is published until you approve it."
    >
      <Suspense fallback={<AuthFormSkeleton fields={1} />}>
        <Verify searchParams={searchParams} />
      </Suspense>
    </AuthFrame>
  );
}

async function Verify({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirect_url);
  return <VerifyEmailForm redirectTo={redirectTo} />;
}
