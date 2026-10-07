import { Suspense } from "react";
import type { Metadata } from "next";
import { safeRedirect } from "@/lib/auth/redirect";
import { inviteTokenFrom } from "@/lib/auth/server";
import { ApprovalPanel } from "@/components/auth/approval-panel";
import { AuthFrame } from "@/components/auth/auth-frame";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { SwitchLink } from "@/components/auth/switch-link";
import { InviteAccept } from "@/components/auth/invite-accept";

export const metadata: Metadata = { title: "Accept your invite" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Params = Promise<{ token?: string[] }>;

export default function InvitePage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  return (
    <AuthFrame top={<SwitchLink prompt="Have an account?" href="/sign-in" label="Sign in" />} panel={<ApprovalPanel />} promise="Nothing is published until you approve it.">
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <Accept params={params} searchParams={searchParams} />
      </Suspense>
    </AuthFrame>
  );
}

/** The token is the URL, so reading it here keeps the frame around it in the prefetched shell. */
async function Accept({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ token: path }, search] = await Promise.all([params, searchParams]);
  const token = inviteTokenFrom({ path: path?.[0], search });
  const redirectTo = safeRedirect(search.redirect_url);
  return <InviteAccept token={token} redirectTo={redirectTo} />;
}
