import { Suspense } from "react";
import type { RouteSearchParams } from "@/lib/types";
import { ApprovalPanel } from "@/modules/auth/components/approval-panel";
import { AuthFormSkeleton } from "@/modules/auth/components/auth-form-skeleton";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { ResetPasswordForm } from "@/modules/auth/components/reset-password-form";

export function ResetPasswordPage({ searchParams }: { searchParams: RouteSearchParams }) {
  return (
    <AuthFrame panel={<ApprovalPanel />} promise="Nothing is published until you approve it.">
      <Suspense fallback={<AuthFormSkeleton fields={1} />}>
        <ResetPassword searchParams={searchParams} />
      </Suspense>
    </AuthFrame>
  );
}

async function ResetPassword({ searchParams }: { searchParams: RouteSearchParams }) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={typeof token === "string" ? token : undefined} />;
}
