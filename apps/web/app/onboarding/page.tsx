import { Suspense } from "react";
import { getViewer } from "@/lib/auth/viewer";
import { getAdminClient } from "@/lib/api/server";
import { OnboardingHeader } from "@/components/shell/onboarding-header";
import { AdminOnboardingHeader } from "@/components/shell/admin-onboarding-header";
import { AdminActingNote } from "@/components/shell/admin-acting-note";
import { OnboardingEntry } from "@/features/onboarding/onboarding-entry";
import { OnboardingLoadingSkeleton } from "@/features/onboarding/onboarding-loading-skeleton";
import { OnboardingResumingSkeleton } from "@/features/onboarding/onboarding-resuming-skeleton";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/** `for` names a client an admin is building a brand for; ignored unless the viewer is an admin and that client exists. */
async function resolveAdminContext(personId: string | undefined): Promise<{ personId: string; personName: string } | null> {
  if (!personId) return null;
  const row = await getAdminClient(personId);
  return row ? { personId, personName: row.client.name ?? row.client.email } : null;
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; clientId?: string; for?: string }>;
}) {
  const [viewer, { url, clientId, for: personId }] = await Promise.all([getViewer(), searchParams]);
  const adminContext = await resolveAdminContext(personId);

  return (
    <div className="min-h-dvh">
      {adminContext ? <AdminOnboardingHeader viewer={viewer} personName={adminContext.personName} /> : <OnboardingHeader viewer={viewer} />}
      {adminContext && <AdminActingNote />}
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24 md:px-6 md:pt-12">
        {/* The header above resolves fast (one lookup, or none); only this fetch is slow, so it gets
            its own boundary — and its fallback can be chosen by whether `clientId` is present (a
            fresh visit vs one resuming), which `loading.tsx` itself never gets to see. */}
        <Suspense fallback={clientId ? <OnboardingResumingSkeleton /> : <OnboardingLoadingSkeleton />}>
          <OnboardingEntry initialUrl={url ?? ""} clientId={clientId} personId={adminContext?.personId} personName={adminContext?.personName ?? null} />
        </Suspense>
      </main>
    </div>
  );
}
