import { notFound } from "next/navigation";
import { getBrand, getOnboarding, getQuestionnaire, getResearch, listSocialAccounts } from "@/lib/api/server";
import { normalizeUrl } from "@/lib/utils";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";
import { OnboardingJourney } from "@/features/onboarding/onboarding-journey";

/**
 * The slow half of both onboarding entry routes (`/onboarding`, admin's `brand/new`): the actual
 * brand/onboarding/questionnaire/research fetch, under its own Suspense boundary so the header
 * above it (a single fast lookup) never waits on it, and so the boundary's fallback can be chosen
 * — S00a for a fresh visit, S00b for one resuming — before this component ever starts fetching.
 */
export async function OnboardingEntry({
  initialUrl,
  brandId,
  personId,
  personName,
}: {
  initialUrl: string;
  brandId: string | undefined;
  personId: string | undefined;
  personName: string | null;
}) {
  const brand = brandId ? await getBrand(brandId) : null;
  if (brandId && !brand) notFound();
  if(!brand) return <OnboardingFlow initialUrl={normalizeUrl(initialUrl)} personId={personId} />;
  const onboarding = await getOnboarding(brand.id);
  if(!onboarding) return <OnboardingFlow initialUrl={normalizeUrl(initialUrl)} personId={personId} />;
  const [questionnaire, research, accounts] = await Promise.all([getQuestionnaire(brand.id), getResearch(brand.id), listSocialAccounts(brand.id)])

  return (
    <OnboardingJourney
      brand={brand}
      onboarding={onboarding}
      questionnaire={questionnaire}
      research={research}
      accounts={accounts}
      personName={personName}
    />
  )
}
