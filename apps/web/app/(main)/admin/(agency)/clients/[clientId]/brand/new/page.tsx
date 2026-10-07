import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAdminClient } from "@/lib/api/server";
import { AdminActingNote } from "@/components/shell/admin-acting-note";
import { Breadcrumb } from "@/components/shell/breadcrumb";
import { OnboardingEntry } from "@/components/onboarding/onboarding-entry";
import { OnboardingLoadingSkeleton } from "@/components/onboarding/onboarding-loading-skeleton";
import { OnboardingResumingSkeleton } from "@/components/onboarding/onboarding-resuming-skeleton";

/**
 * An admin building a brand for an existing client, keyed by that client's id in the route.
 * Sits under `(agency)`, so the top bar, the admin nav and the page frame all come from that
 * group's layout; this file adds only the crumbs, the acting note and the flow itself.
 *
 * Two ids meet here, which is why they are renamed on the way in: `params.clientId` is the person
 * the brand is being built for, and `?brandId=` appears once the brand kit is saved, carrying the
 * new brand's own id so the flow continues as `OnboardingJourney`.
 *
 * Props come from the generated `PageProps` rather than a hand-written type: the route moved once
 * already (from `/admin/c/:brandId/brand/new`), and a hand-written `params` type agreed with the
 * old segment name while the real one had changed.
 */
export default async function NewBrandPage(props: PageProps<"/admin/clients/[clientId]/brand/new">) {
  const [{ clientId }, { brandId }] = await Promise.all([props.params, props.searchParams]);
  const person = await getAdminClient(clientId);
  if (!person) notFound();
  const personName = person.client.name ?? person.client.email;
  const resumingBrandId = typeof brandId === "string" ? brandId : undefined;

  return (
    <>
      <Breadcrumb
        className="mb-3"
        trail={[
          { label: "Clients", href: "/admin/clients" },
          { label: personName, href: `/admin/clients/${clientId}` },
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
