import type { Metadata } from "next";
import { safeRedirect, withRedirect } from "@/lib/auth/redirect";
import { APP_NAME } from "@/lib/utils";
import { ApprovalPanel } from "@/components/auth/approval-panel";
import { AuthFrame } from "@/components/auth/auth-frame";
import { SwitchLink } from "@/components/auth/switch-link";
import { SignInForm } from "@/features/auth/sign-in-form";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "Sign in" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirect_url);
  const signUpHref = withRedirect("/sign-up", redirectTo);
  return (
    <AuthFrame top={<SwitchLink prompt={`New to ${APP_NAME}?`} href={signUpHref} label="Create an account" />} panel={<ApprovalPanel />} promise="Nothing is published until you approve it.">
      <SignInForm redirectTo={redirectTo} sessionEnded={params.reason === "session-ended"} />
    </AuthFrame>
  );
}
