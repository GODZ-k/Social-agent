import { Suspense } from "react";
import { getViewer } from "@/lib/auth/viewer";
import { getAdminClient } from "@/lib/api/server";
import { AdminOnboardingHeader } from "@/components/shell/admin-onboarding-header";
import { AdminActingNote } from "@/components/shell/admin-acting-note";
import { OnboardingEntry } from "@/features/onboarding/onboarding-entry";
import { OnboardingLoadingSkeleton } from "@/features/onboarding/onboarding-loading-skeleton";
import { OnboardingResumingSkeleton } from "@/features/onboarding/onboarding-resuming-skeleton";
import { TopBar } from "@/components/shell/top-bar";

/** `for` names a brand an admin is building a brand for; ignored unless the viewer is an admin and that brand exists. */
async function resolveAdminContext(personId: string | undefined): Promise<{ personId: string; personName: string } | null> {
  if (!personId) return null;
  const row = await getAdminClient(personId);
  return row ? { personId, personName: row.client.name ?? row.client.email } : null;
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; brandId?: string; for?: string }>;
}) {
  const [viewer, { url, brandId, for: personId }] = await Promise.all([getViewer(), searchParams]);
  const adminContext = await resolveAdminContext(personId);

  return (
    <div className="min-h-dvh">
      {adminContext ? <AdminOnboardingHeader viewer={viewer} personName={adminContext.personName} /> : <TopBar viewer={viewer} />}
      {adminContext && <AdminActingNote />}
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24 md:px-6 md:pt-12">
        {/* The header above resolves fast (one lookup, or none); only this fetch is slow, so it gets
            its own boundary — and its fallback can be chosen by whether `brandId` is present (a
            fresh visit vs one resuming), which `loading.tsx` itself never gets to see. */}
        <Suspense fallback={brandId ? <OnboardingResumingSkeleton /> : <OnboardingLoadingSkeleton />}>
          <OnboardingEntry initialUrl={url ?? ""} brandId={brandId} personId={adminContext?.personId} personName={adminContext?.personName ?? null} />
        </Suspense>
      </main>
    </div>
  );
}
