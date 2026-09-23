import { notFound } from "next/navigation";
import { getClient } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import { PageHeader } from "@repo/ui/components/states";
import { resolveTab } from "@/features/settings/tabs";
import { SettingsTabs } from "@/features/settings/settings-tabs";
import { TabTransition } from "@/features/settings/tab-transition";
import { SettingsBrandKitForm } from "@/features/brand-kit/settings-brand-kit-form";
import { SocialAccounts } from "@/features/settings/social-accounts";
import { PreferencesForm } from "@/features/settings/preferences-form";
import { DeleteClient } from "@/features/settings/delete-client";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ clientId }, { tab: tabParam }] = await Promise.all([params, searchParams]);
  const [client, viewer] = await Promise.all([getClient(clientId), getViewer()]);
  if (!client) notFound();

  const tab = resolveTab(tabParam);
  const needsConnection = client.platforms.filter(
    (p) => client.accounts.find((a) => a.platform === p)?.status !== "connected",
  ).length;

  return (
    <>
      <PageHeader title="Settings" description="Change what the agent knows about this brand, and where it's allowed to publish." />

      <SettingsTabs tab={tab} needsConnection={needsConnection} />

      <TabTransition tab={tab}>
        {tab === "brand" && <SettingsBrandKitForm client={client} />}
        {tab === "accounts" && <SocialAccounts client={client} />}
        {tab === "preferences" && (
          <div className="grid gap-5">
            <PreferencesForm clientId={client.id} preferences={client.preferences} />
            <DeleteClient client={client} isAdmin={viewer.role === "admin"} />
          </div>
        )}
      </TabTransition>
    </>
  );
}
