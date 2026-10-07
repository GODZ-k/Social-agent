import { Suspense } from "react";
import type { Metadata } from "next";
import { ApprovalPanel } from "@/components/auth/approval-panel";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { AuthFrame } from "@/components/auth/auth-frame";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Choose a new password" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <AuthFrame panel={<ApprovalPanel />} promise="Nothing is published until you approve it.">
      <Suspense fallback={<AuthFormSkeleton fields={1} />}>
        <ResetPassword searchParams={searchParams} />
      </Suspense>
    </AuthFrame>
  );
}

async function ResetPassword({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={typeof token === "string" ? token : undefined} />;
}
