import { notFound } from "next/navigation";
import { getClient, getPreferences, listSocialAccounts } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import { PageHeader } from "@repo/ui/components/states";
import { resolveTab } from "@/features/settings/tabs";
import { SettingsTabs } from "@/features/settings/settings-tabs";
import { TabTransition } from "@/features/settings/tab-transition";
import { ArchivedBanner } from "@/features/settings/archived-banner";
import { SettingsBrandKitForm } from "@/features/brand-kit/settings-brand-kit-form";
import { SocialAccounts } from "@/features/settings/social-accounts";
import { PreferencesForm } from "@/features/settings/preferences-form";
import { DangerZone } from "@/features/settings/danger-zone";

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ brandId }, { tab: tabParam }] = await Promise.all([params, searchParams]);
  const [client, viewer] = await Promise.all([getClient(brandId), getViewer()]);
  if (!client) notFound();

  const [preferences, accounts] = await Promise.all([getPreferences(brandId), listSocialAccounts(brandId)]);
  const tab = resolveTab(tabParam);
  const needsConnection = accounts.filter((a) => a.inPlan && a.state !== "connected").length;
  const isAdmin = viewer.role === "admin";

  return (
    <>
      <PageHeader title="Settings" description={`The brand kit, social accounts and preferences for ${client.name}.`} />

      {client.status === "archived" && <ArchivedBanner client={client} className="mb-6" />}

      <SettingsTabs tab={tab} needsConnection={needsConnection} />

      <TabTransition tab={tab}>
        {tab === "brand" && <SettingsBrandKitForm client={client} accounts={accounts} />}
        {tab === "accounts" && <SocialAccounts brandId={client.id} accounts={accounts} />}
        {tab === "preferences" && (
          <div className="grid gap-5">
            {preferences && <PreferencesForm brandId={client.id} preferences={preferences} />}
            <DangerZone client={client} isAdmin={isAdmin} />
          </div>
        )}
      </TabTransition>
    </>
  );
}
