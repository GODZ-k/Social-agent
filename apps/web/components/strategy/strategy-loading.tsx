import { PageHeader, SkeletonRows } from "@repo/ui/components/states";

export default function StrategyLoading() {
  return (
    <>
      <PageHeader title="Strategy" description="What the agent will post, how often and why." />
      <SkeletonRows rows={4} className="[&>*]:h-40" />
    </>
  );
}
