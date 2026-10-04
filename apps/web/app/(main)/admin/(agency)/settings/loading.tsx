import { PageHeaderInline, SkeletonRows } from "@repo/ui/components/states";

export default function AdminSettingsLoading() {
  return (
    <>
      <PageHeaderInline title="Settings" description="Your agency's team and what Cadence emails you about." />
      <SkeletonRows rows={4} className="[&>*]:h-24" />
    </>
  );
}
