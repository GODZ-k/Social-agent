import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { getAdminClient } from "@/lib/api/server";
import { AdminOnboardingHeader } from "@/components/shell/admin-onboarding-header";
import { AdminActingNote } from "@/components/shell/admin-acting-note";
import { OnboardingEntry } from "@/features/onboarding/onboarding-entry";
import { OnboardingLoadingSkeleton } from "@/features/onboarding/onboarding-loading-skeleton";
import { OnboardingResumingSkeleton } from "@/features/onboarding/onboarding-resuming-skeleton";

/**
 * An admin building a brand for an existing brand, keyed by the brand's own id in the route
 * (replaces `/onboarding?for=:clientId`). Sits beside the `(workspace)` group, not inside it: that
 * group's layout renders the brand-workspace chrome for a brand that exists, which this route,
 * before the brand is created, does not have. Once the brand kit is saved, `?brandId=` carries
 * the new brand's own id and the page switches to `OnboardingJourney`, same as onboarding's `for=` case did.
 * The route segment is named `brandId` to match the sibling `(workspace)` routes, even though here,
 * before a brand exists, it actually holds the brand's (person's) id.
 */
export default async function NewBrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ brandId?: string }>;
}) {
  const [{ brandId: personId }, { brandId }, viewer] = await Promise.all([params, searchParams, getViewer()]);
  const person = await getAdminClient(personId);
  if (!person) notFound();
  const personName = person.client.name ?? person.client.email;

  return (
    <div className="min-h-dvh">
      <AdminOnboardingHeader viewer={viewer} personName={personName} />
      <AdminActingNote />
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24 md:px-6 md:pt-12">
        {/* The header above resolves fast (one lookup); only this fetch is slow, so it gets its own
            boundary — and its fallback can be chosen by whether `brandId` is present (a fresh visit
            vs one resuming), which `loading.tsx` itself never gets to see. */}
        <Suspense fallback={brandId ? <OnboardingResumingSkeleton /> : <OnboardingLoadingSkeleton />}>
          <OnboardingEntry initialUrl="" brandId={brandId} personId={personId} personName={personName} />
        </Suspense>
      </main>
    </div>
  );
}
