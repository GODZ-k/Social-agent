import { PageHeader, SkeletonRows } from "@repo/ui/components/states";

export default function AnalyticsLoading() {
  return (
    <>
      <PageHeader title="Analytics" description="How your posts did, in plain numbers, and what the agent changed because of it." />
      <SkeletonRows rows={2} className="[&>*]:h-72" />
    </>
  );
}
