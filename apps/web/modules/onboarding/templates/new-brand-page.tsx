import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { routes } from "@/config/routes";
import { getAdminClient } from "@/lib/api/server";
import type { RouteSearchParams } from "@/lib/types";
import { AdminActingNote } from "@/modules/admin/components/admin-acting-note";
import { OnboardingEntry } from "@/modules/onboarding/components/onboarding-entry";
import { OnboardingLoadingSkeleton } from "@/modules/onboarding/templates/onboarding-loading-skeleton";
import { OnboardingResumingSkeleton } from "@/modules/onboarding/templates/onboarding-resuming-skeleton";

/**
 * An admin building a brand for an existing client, keyed by that client's id in the route.
 * Sits under `(agency)`, so the top bar, the admin nav and the page frame all come from that
 * group's layout; this template adds only the crumbs, the acting note and the flow itself.
 *
 * Two ids meet here, which is why they are renamed on the way in: `clientId` is the person the
 * brand is being built for, and `?brandId=` appears once the brand kit is saved, carrying the new
 * brand's own id so the flow continues as `OnboardingJourney`.
 */
export async function NewBrandPage({ params, searchParams }: { params: Promise<{ clientId: string }>; searchParams: RouteSearchParams }) {
  const [{ clientId }, { brandId }] = await Promise.all([params, searchParams]);
  const person = await getAdminClient(clientId);
  if (!person) notFound();
  const personName = person.client.name ?? person.client.email;
  const resumingBrandId = typeof brandId === "string" ? brandId : undefined;

  return (
    <>
      <Breadcrumb
        className="mb-3"
        trail={[
          { label: "Clients", href: routes.admin.clients.list },
          { label: personName, href: routes.admin.clients.detail(clientId) },
          { label: "New brand" },
        ]}
      />
      <AdminActingNote />
      {/* Only this fetch is slow, so it gets its own boundary — and its fallback can be chosen by
          whether `brandId` is present (a fresh visit vs one resuming), which `loading.tsx` never
          gets to see. */}
      <Suspense fallback={resumingBrandId ? <OnboardingResumingSkeleton /> : <OnboardingLoadingSkeleton />}>
        <OnboardingEntry initialUrl="" brandId={resumingBrandId} personId={clientId} personName={personName} />
      </Suspense>
    </>
  );
}
