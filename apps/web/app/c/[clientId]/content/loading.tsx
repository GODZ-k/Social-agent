import { PageHeader, SkeletonRows } from "@repo/ui/components/states";

export default function ContentLoading() {
  return (
    <>
      <PageHeader title="Content" description="Every post the agent has drafted for this client, from first draft to published." />
      <SkeletonRows rows={6} />
    </>
  );
}
