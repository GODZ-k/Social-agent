import { Suspense } from "react";
import { getAdminClient } from "@/lib/api/server";
import { AdminActingNote } from "@/components/shell/admin-acting-note";
import { OnboardingEntry } from "@/components/onboarding/onboarding-entry";
import { OnboardingLoadingSkeleton } from "@/components/onboarding/onboarding-loading-skeleton";
import { OnboardingResumingSkeleton } from "@/components/onboarding/onboarding-resuming-skeleton";
import { SignedInTopBar } from "@/components/shell/top-bar";

/**
 * `for` names the client an admin is building a brand for. `getAdminClient` returns null unless the
 * viewer is an admin and that client exists, so a client cannot name someone else by editing the URL.
 */
async function resolveAdminContext(
  personId: string | undefined,
): Promise<{ personId: string; personName: string } | null> {
  if (!personId) return null;
  const row = await getAdminClient(personId);
  return row ? { personId, personName: row.client.name ?? row.client.email } : null;
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; brandId?: string; for?: string }>;
}) {
  const { url, brandId, for: personId } = await searchParams;
  const adminContext = await resolveAdminContext(personId);

  return (
    <div className="min-h-dvh">
      {/* The bar stays in the page, not a layout: the person it names comes from `?for=`, and a
          layout never sees `searchParams`. */}
      <SignedInTopBar onboarding personName={adminContext?.personName} />
      {adminContext && <AdminActingNote />}
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24 md:px-6 md:pt-12">
        {/* The bar above resolves fast (one lookup, or none); only this fetch is slow, so it gets
            its own boundary — and its fallback can be chosen by whether `brandId` is present (a
            fresh visit vs one resuming), which `loading.tsx` itself never gets to see. */}
        <Suspense fallback={brandId ? <OnboardingResumingSkeleton /> : <OnboardingLoadingSkeleton />}>
          <OnboardingEntry
            initialUrl={url ?? ""}
            brandId={brandId}
            personId={adminContext?.personId}
            personName={adminContext?.personName ?? null}
          />
        </Suspense>
      </main>
    </div>
  );
}
