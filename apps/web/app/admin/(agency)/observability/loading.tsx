import { PageHeader, SkeletonRows } from "@repo/ui/components/states";

export default function ObservabilityLoading() {
  return (
    <>
      <PageHeader title="Observability" description="How the app, the server and the AI agents are doing, across every client." />
      <SkeletonRows rows={4} className="[&>*]:h-24" />
    </>
  );
}
