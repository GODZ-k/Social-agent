import type { Metadata } from "next";
import { safeRedirect } from "@/lib/auth/redirect";
import { normalizeUrl } from "@/lib/utils";
import { ApprovalPanel } from "@/components/auth/approval-panel";
import { AuthFrame } from "@/components/auth/auth-frame";
import { SwitchLink } from "@/components/auth/switch-link";
import { SignUpForm } from "@/features/auth/sign-up-form";
import { SiteCarry } from "@/features/auth/site-carry";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "Create your account" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SignUpPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const site = typeof params.url === "string" ? normalizeUrl(params.url) : null;
  const fallback = site ? `/onboarding?url=${encodeURIComponent(site)}` : "/";
  const redirectTo = safeRedirect(params.redirect_url, fallback);
  return (
    <AuthFrame top={<SwitchLink prompt="Have an account?" href="/sign-in" label="Sign in" />} panel={<ApprovalPanel />} promise="Nothing is published until you approve it.">
      <SignUpForm redirectTo={redirectTo} site={site ? <SiteCarry url={site} /> : null} />
    </AuthFrame>
  );
}
