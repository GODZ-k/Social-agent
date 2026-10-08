import { PageHeader, SkeletonRows } from "@repo/ui/components/states";

export default function StrategyResearchLoading() {
  return (
    <>
      <PageHeader
        title="Research"
        description="What the agent learned about your market before planning. Your strategy is built on it."
      />
      <SkeletonRows rows={4} className="[&>*]:h-40" />
    </>
  );
}
