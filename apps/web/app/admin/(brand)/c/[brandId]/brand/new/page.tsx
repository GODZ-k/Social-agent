import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { getAdminClient, getClient, getOnboarding, getQuestionnaire, getResearch } from "@/lib/api/server";
import { AdminOnboardingHeader } from "@/components/shell/admin-onboarding-header";
import { AdminActingNote } from "@/components/shell/admin-acting-note";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";
import { OnboardingJourney } from "@/features/onboarding/onboarding-journey";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/**
 * An admin building a brand for an existing client, keyed by the client's own id in the route
 * (replaces `/onboarding?for=:clientId`). Sits beside the `(workspace)` group, not inside it: that
 * group's layout renders the brand-workspace chrome for a brand that exists, which this route,
 * before the brand is created, does not have. Once the brand kit is saved, `?brandId=` carries
 * the new brand's own id and the page switches to `OnboardingJourney`, same as onboarding's `for=` case did.
 * The route segment is named `brandId` to match the sibling `(workspace)` routes, even though here,
 * before a brand exists, it actually holds the client's (person's) id.
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
  const [brand, onboarding, questionnaire, research] = brandId
    ? await Promise.all([getClient(brandId), getOnboarding(brandId), getQuestionnaire(brandId), getResearch(brandId)])
    : [null, null, null, null];
  if (brandId && !brand) notFound();

  return (
    <div className="min-h-dvh">
      <AdminOnboardingHeader viewer={viewer} personName={personName} />
      <AdminActingNote />
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24 md:px-6 md:pt-12">
        {brand && onboarding ? (
          <OnboardingJourney client={brand} onboarding={onboarding} questionnaire={questionnaire} research={research} personName={personName} />
        ) : (
          <OnboardingFlow initialUrl="" personId={personId} />
        )}
      </main>
    </div>
  );
}
