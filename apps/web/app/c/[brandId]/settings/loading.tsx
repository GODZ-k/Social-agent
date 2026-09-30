import { PageHeader, SkeletonRows } from "@repo/ui/components/states";

/** The description names the brand, so it streams with the page rather than standing in here. */
export default function SettingsLoading() {
  return (
    <>
      <PageHeader title="Settings" />
      <SkeletonRows rows={3} className="[&>*]:h-40" />
    </>
  );
}
