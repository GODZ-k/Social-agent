import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { normalizeUrl } from "@/lib/utils";
import { getAdminClient, getClient, getOnboarding, getQuestionnaire, getResearch } from "@/lib/api/server";
import { OnboardingHeader } from "@/components/shell/onboarding-header";
import { AdminOnboardingHeader } from "@/components/shell/admin-onboarding-header";
import { AdminActingNote } from "@/components/shell/admin-acting-note";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";
import { OnboardingJourney } from "@/features/onboarding/onboarding-journey";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/** `for` names a client an admin is building a brand for; ignored unless the viewer is an admin and that client exists. */
async function resolveAdminContext(personId: string | undefined): Promise<{ personId: string; personName: string } | null> {
  if (!personId) return null;
  const row = await getAdminClient(personId);
  return row ? { personId, personName: row.client.name ?? row.client.email } : null;
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; clientId?: string; for?: string }>;
}) {
  const [viewer, { url, clientId, for: personId }] = await Promise.all([getViewer(), searchParams]);
  const [client, adminContext] = await Promise.all([clientId ? getClient(clientId) : null, resolveAdminContext(personId)]);
  if (clientId && !client) notFound();
  const [onboarding, questionnaire, research] = client
    ? await Promise.all([getOnboarding(client.id), getQuestionnaire(client.id), getResearch(client.id)])
    : [null, null, null];

  return (
    <div className="min-h-dvh">
      {adminContext ? <AdminOnboardingHeader viewer={viewer} personName={adminContext.personName} /> : <OnboardingHeader viewer={viewer} />}
      {adminContext && <AdminActingNote />}
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24 md:px-6 md:pt-12">
        {client && onboarding ? (
          <OnboardingJourney
            client={client}
            onboarding={onboarding}
            questionnaire={questionnaire}
            research={research}
            personName={adminContext?.personName ?? null}
          />
        ) : (
          <OnboardingFlow initialUrl={normalizeUrl(url ?? "")} personId={adminContext?.personId} />
        )}
      </main>
    </div>
  );
}
