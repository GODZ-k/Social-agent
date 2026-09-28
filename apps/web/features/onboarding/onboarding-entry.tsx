import { notFound } from "next/navigation";
import { getClient, getOnboarding, getQuestionnaire, getResearch, listSocialAccounts } from "@/lib/api/server";
import { normalizeUrl } from "@/lib/utils";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";
import { OnboardingJourney } from "@/features/onboarding/onboarding-journey";

/**
 * The slow half of both onboarding entry routes (`/onboarding`, admin's `brand/new`): the actual
 * client/onboarding/questionnaire/research fetch, under its own Suspense boundary so the header
 * above it (a single fast lookup) never waits on it, and so the boundary's fallback can be chosen
 * — S00a for a fresh visit, S00b for one resuming — before this component ever starts fetching.
 */
export async function OnboardingEntry({
  initialUrl,
  clientId,
  personId,
  personName,
}: {
  initialUrl: string;
  clientId: string | undefined;
  personId: string | undefined;
  personName: string | null;
}) {
  const client = clientId ? await getClient(clientId) : null;
  if (clientId && !client) notFound();
  const [onboarding, questionnaire, research, accounts] = client
    ? await Promise.all([getOnboarding(client.id), getQuestionnaire(client.id), getResearch(client.id), listSocialAccounts(client.id)])
    : [null, null, null, []];

  return client && onboarding ? (
    <OnboardingJourney
      client={client}
      onboarding={onboarding}
      questionnaire={questionnaire}
      research={research}
      accounts={accounts}
      personName={personName}
    />
  ) : (
    <OnboardingFlow initialUrl={normalizeUrl(initialUrl)} personId={personId} />
  );
}
