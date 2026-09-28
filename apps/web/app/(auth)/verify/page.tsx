import type { Metadata } from "next";
import { safeRedirect } from "@/lib/auth/redirect";
import { ApprovalPanel } from "@/components/auth/approval-panel";
import { AuthFrame } from "@/components/auth/auth-frame";
import { SwitchLink } from "@/components/auth/switch-link";
import { VerifyEmailForm } from "@/features/auth/verify-email-form";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "Verify your email" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function VerifyPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirect_url);
  return (
    <AuthFrame top={<SwitchLink href="/sign-in" label="Back to sign in" />} panel={<ApprovalPanel />} promise="Nothing is published until you approve it.">
      <VerifyEmailForm redirectTo={redirectTo} />
    </AuthFrame>
  );
}
