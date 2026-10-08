import { Suspense } from "react";
import { getAdminClient } from "@/lib/api/server";
import type { RouteSearchParams } from "@/lib/types";
import { AdminActingNote } from "@/modules/admin/components/admin-acting-note";
import { OnboardingEntry } from "@/modules/onboarding/components/onboarding-entry";
import { OnboardingLoadingSkeleton } from "@/modules/onboarding/templates/onboarding-loading-skeleton";
import { OnboardingResumingSkeleton } from "@/modules/onboarding/templates/onboarding-resuming-skeleton";
import { SignedInTopBar } from "@/modules/shell/components/top-bar";

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

/** One value for a key; a repeated one arrives as an array, which is never a url, id or person. */
function one(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function OnboardingPage({ searchParams }: { searchParams: RouteSearchParams }) {
  const params = await searchParams;
  const brandId = one(params.brandId);
  const adminContext = await resolveAdminContext(one(params.for));

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
            initialUrl={one(params.url) ?? ""}
            brandId={brandId}
            personId={adminContext?.personId}
            personName={adminContext?.personName ?? null}
          />
        </Suspense>
      </main>
    </div>
  );
}
