import { Suspense } from "react";
import { routes } from "@/config/routes";
import type { RouteSearchParams } from "@/lib/types";
import { safeRedirect } from "@/lib/auth/redirect";
import { inviteTokenFrom } from "@/lib/auth/server";
import { ApprovalPanel } from "@/modules/auth/components/approval-panel";
import { AuthFrame } from "@/modules/auth/components/auth-frame";
import { AuthFormSkeleton } from "@/modules/auth/components/auth-form-skeleton";
import { SwitchLink } from "@/modules/auth/components/switch-link";
import { InviteAccept } from "@/modules/auth/components/invite-accept";

/** The invite token can arrive in the path or the query, so both are read below the frame. */
type InviteParams = Promise<{ token?: string[] }>;

export function InvitePage({ params, searchParams }: { params: InviteParams; searchParams: RouteSearchParams }) {
  return (
    <AuthFrame top={<SwitchLink prompt="Have an account?" href={routes.auth.signIn} label="Sign in" />} panel={<ApprovalPanel />} promise="Nothing is published until you approve it.">
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <Accept params={params} searchParams={searchParams} />
      </Suspense>
    </AuthFrame>
  );
}

/** The token is the URL, so reading it here keeps the frame around it in the prefetched shell. */
async function Accept({ params, searchParams }: { params: InviteParams; searchParams: RouteSearchParams }) {
  const [{ token: path }, search] = await Promise.all([params, searchParams]);
  const token = inviteTokenFrom({ path: path?.[0], search });
  const redirectTo = safeRedirect(search.redirect_url);
  return <InviteAccept token={token} redirectTo={redirectTo} />;
}
