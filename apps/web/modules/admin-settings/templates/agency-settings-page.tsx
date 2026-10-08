import { notFound } from "next/navigation";
import { PageHeaderInline } from "@repo/ui/components/states";
import { getAgencySettings } from "@/lib/api/server";
import { getViewer } from "@/lib/auth/viewer";
import type { RouteSearchParams } from "@/lib/types";
import { resolveAdminSettingsTab } from "@/modules/admin-settings/utils/tabs";
import { AdminSettingsTabs } from "@/modules/admin-settings/components/admin-settings-tabs";
import { AdminSettingsTabTransition } from "@/modules/admin-settings/components/tab-transition";
import { SettingsTiles } from "@/modules/admin-settings/components/settings-tiles";
import { InviteTeammateButton } from "@/modules/admin-settings/components/invite-teammate-button";
import { TeamPanel } from "@/modules/admin-settings/components/team-panel";
import { ChannelsPanel } from "@/modules/admin-settings/components/channels-panel";
import { AlertsPanel } from "@/modules/admin-settings/components/alerts-panel";

export async function AgencySettingsPage({ searchParams }: { searchParams: RouteSearchParams }) {
  const [settings, viewer, { tab: tabParam }] = await Promise.all([getAgencySettings(), getViewer(), searchParams]);
  if (!settings) notFound();
  const tab = resolveAdminSettingsTab(typeof tabParam === "string" ? tabParam : undefined);

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
