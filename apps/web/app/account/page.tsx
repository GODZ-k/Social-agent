import type { Metadata } from "next";
import { getAccount, getClient } from "@/lib/api/server";
import { getViewer, getViewerRole } from "@/lib/auth/viewer";
import { OnboardingHeader } from "@/components/shell/onboarding-header";
import { PageHeader } from "@repo/ui/components/states";
import { DetailsPanel } from "@/features/account/details-panel";
import { PasswordPanel } from "@/features/account/password-panel";
import { SessionsPanel } from "@/features/account/sessions-panel";
import { TwoFactorManage } from "@/features/auth/two-factor-manage";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "Your account" };

/**
 * BA-2: your details and how you sign in, the same for every brand you own.
 * Standalone (no side rail): reached from every brand's account menu, so it
 * covers no one workspace in particular. `from` names the brand the account
 * menu was opened from, so the header can offer a way back to it.
 */
export default async function AccountPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const [{ from }, viewer, role, view] = await Promise.all([searchParams, getViewer(), getViewerRole(), getAccount()]);
  const backToBrand = from ? await getClient(from) : null;

  return (
    <div className="min-h-dvh">
      <OnboardingHeader viewer={viewer} backTo={backToBrand ?? undefined} />
      <main id="main" className="mx-auto w-full max-w-2xl px-4 pt-6 pb-16 sm:px-8">
        <PageHeader title="Your account" description="Your details and how you sign in. The same for every brand you own." />
        <div className="grid gap-5">
          <DetailsPanel details={view.details} />
          <PasswordPanel changedAt={view.passwordChangedAt} />
          <TwoFactorManage isAdmin={role === "admin"} />
          <SessionsPanel sessions={view.sessions} />
        </div>
      </main>
    </div>
  );
}
