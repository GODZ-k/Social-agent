import { notFound } from "next/navigation";
import { getAgencySettings } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import { PageHeaderInline } from "@repo/ui/components/states";
import { resolveAdminSettingsTab } from "@/components/admin-settings/tabs";
import { AdminSettingsTabs } from "@/components/admin-settings/admin-settings-tabs";
import { AdminSettingsTabTransition } from "@/components/admin-settings/tab-transition";
import { SettingsTiles } from "@/components/admin-settings/settings-tiles";
import { InviteTeammateButton } from "@/components/admin-settings/invite-teammate-button";
import { TeamPanel } from "@/components/admin-settings/team-panel";
import { ChannelsPanel } from "@/components/admin-settings/channels-panel";
import { AlertsPanel } from "@/components/admin-settings/alerts-panel";

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [settings, viewer, { tab: tabParam }] = await Promise.all([getAgencySettings(), getViewer(), searchParams]);
  if (!settings) notFound();
  const tab = resolveAdminSettingsTab(tabParam);

  return (
    <>
      <PageHeaderInline
        title="Settings"
        description="Your agency's team and what Cadence emails you about."
        actions={tab === "team" && <InviteTeammateButton />}
      />
      <SettingsTiles team={settings.team} channels={settings.channels} />
      <AdminSettingsTabs tab={tab} />
      <AdminSettingsTabTransition tab={tab}>
        {tab === "team" && <TeamPanel team={settings.team} viewerEmail={viewer.email} />}
        {tab === "notifications" && (
          <div className="grid gap-5">
            <ChannelsPanel channels={settings.channels} />
            <AlertsPanel alerts={settings.alerts} />
          </div>
        )}
      </AdminSettingsTabTransition>
    </>
  );
}
