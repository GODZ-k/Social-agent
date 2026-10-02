import { notFound, redirect } from "next/navigation";
import { getBrand, getOnboarding, getQuestionnaire, listSocialAccounts } from "@/lib/api/server";
import { normalizeUrl } from "@/lib/utils";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";
import { OnboardingJourney } from "@/features/onboarding/onboarding-journey";

/**
 * The slow half of both onboarding entry routes (`/onboarding`, admin's `brand/new`): the actual
 * brand/onboarding/questionnaire fetch, under its own Suspense boundary so the header above it (a
 * single fast lookup) never waits on it, and so the boundary's fallback can be chosen — S00a for a
 * fresh visit, S00b for one resuming — before this component ever starts fetching.
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
  if (!brand) return <OnboardingFlow initialUrl={normalizeUrl(initialUrl)} personId={personId} />;
  const onboarding = await getOnboarding(brand.id);
  if (!onboarding) return <OnboardingFlow initialUrl={normalizeUrl(initialUrl)} personId={personId} />;

  // Onboarding is over once the questionnaire is approved; discovery and everything after it
  // happen in the brand's workspace. Someone returning to this URL belongs there, not here.
  const basePath: WorkspaceBasePath = personName ? "/admin/c" : "/c";
  if (onboarding.step === "done") redirect(workspaceHref(basePath, brand.id));

  const [questionnaire, accounts] = await Promise.all([getQuestionnaire(brand.id), listSocialAccounts(brand.id)]);

  return (
    <OnboardingJourney
      brand={brand}
      onboarding={onboarding}
      questionnaire={questionnaire}
      accounts={accounts}
      personName={personName}
    />
  );
}
