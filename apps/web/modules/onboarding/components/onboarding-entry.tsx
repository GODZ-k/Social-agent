import { notFound, redirect } from "next/navigation";
import { getBrand, getOnboarding, getQuestionnaire, listSocialAccounts } from "@/lib/api/server";
import { normalizeUrl } from "@/lib/utils";
import { OnboardingFlow } from "./onboarding-flow";
import { OnboardingJourney } from "./onboarding-journey";
import { routes, workspaceRoutes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

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
  const basePath: WorkspaceBase = personName ? routes.admin.brand.base : routes.brand.base;
  if (onboarding.step === "done") redirect(workspaceRoutes(basePath).overview(brand.id));

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
