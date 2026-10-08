import { AgencySettingsPage } from "@/modules/admin-settings/templates/agency-settings-page";

export default function Page(props: PageProps<"/admin/settings">) {
  return <AgencySettingsPage searchParams={props.searchParams} />;
}
