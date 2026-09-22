import { PageHeader, SkeletonRows } from "@repo/ui/components/states";

export default function StrategyLoading() {
  return (
    <>
      <PageHeader
        title="Strategy"
        description="What the agent plans to post, how often, and why. It rewrites this each time results come in."
      />
      <SkeletonRows rows={3} className="[&>*]:h-40" />
    </>
  );
}
