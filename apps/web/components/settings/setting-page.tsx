import { notFound } from "next/navigation";
import { getBrand, getPreferences, listSocialAccounts } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import { PageHeader } from "@repo/ui/components/states";
import { resolveTab } from "@/components/settings/tabs";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { TabTransition } from "@/components/settings/tab-transition";
import { ArchivedBanner } from "@/components/settings/archived-banner";
import { SettingsBrandKitForm } from "@/components/brand-kit/settings-brand-kit-form";
import { SocialAccounts } from "@/components/settings/social-accounts";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { DangerZone } from "@/components/settings/danger-zone";

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ brandId }, { tab: tabParam }] = await Promise.all([params, searchParams]);
  const [brand, viewer] = await Promise.all([getBrand(brandId), getViewer()]);
  if (!brand) notFound();

  const [preferences, accounts] = await Promise.all([getPreferences(brandId), listSocialAccounts(brandId)]);
  const tab = resolveTab(tabParam);
  const needsConnection = accounts.filter((a) => a.inPlan && a.state !== "connected").length;
  const isAdmin = viewer.role === "admin";

  return (
    <>
      <PageHeader title="Settings" description={`The brand kit, social accounts and preferences for ${brand.name}.`} />

      {brand.status === "archived" && <ArchivedBanner brand={brand} className="mb-6" />}

      <SettingsTabs tab={tab} needsConnection={needsConnection} />

      <TabTransition tab={tab}>
        {tab === "brand" && <SettingsBrandKitForm brand={brand} accounts={accounts} />}
        {tab === "accounts" && <SocialAccounts brandId={brand.id} accounts={accounts} />}
        {tab === "preferences" && (
          <div className="grid gap-5">
            {preferences && <PreferencesForm brandId={brand.id} preferences={preferences} />}
            <DangerZone brand={brand} isAdmin={isAdmin} />
          </div>
        )}
      </TabTransition>
    </>
  );
}
