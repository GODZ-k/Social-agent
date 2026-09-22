import { PageHeader, SkeletonRows } from "@repo/ui/components/states";

export default function AnalyticsLoading() {
  return (
    <>
      <PageHeader title="Analytics" description="How published posts performed over the last 30 days, and what the agent took from it." />
      <SkeletonRows rows={2} className="[&>*]:h-72" />
    </>
  );
}
