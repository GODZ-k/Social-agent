import type { Metadata } from "next";
import { safeRedirect } from "@/lib/auth/redirect";
import { inviteTokenFrom } from "@/lib/auth/server";
import { ApprovalPanel } from "@/components/auth/approval-panel";
import { AuthFrame } from "@/components/auth/auth-frame";
import { SwitchLink } from "@/components/auth/switch-link";
import { InviteAccept } from "@/features/auth/invite-accept";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "Accept your invite" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function InvitePage({ params, searchParams }: { params: Promise<{ token?: string[] }>; searchParams: SearchParams }) {
  const [{ token: path }, search] = await Promise.all([params, searchParams]);
  const token = inviteTokenFrom({ path: path?.[0], search });
  const redirectTo = safeRedirect(search.redirect_url);
  return (
    <AuthFrame top={<SwitchLink prompt="Have an account?" href="/sign-in" label="Sign in" />} panel={<ApprovalPanel />} promise="Nothing is published until you approve it.">
      <InviteAccept token={token} redirectTo={redirectTo} />
    </AuthFrame>
  );
}
