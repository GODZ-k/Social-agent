import type { Metadata } from "next";
import { ApprovalPanel } from "@/components/auth/approval-panel";
import { AuthFrame } from "@/components/auth/auth-frame";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "Choose a new password" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;
  return (
    <AuthFrame panel={<ApprovalPanel />} promise="Nothing is published until you approve it.">
      <ResetPasswordForm token={typeof token === "string" ? token : undefined} />
    </AuthFrame>
  );
}
