import { PageHeader, SkeletonRows } from "@repo/ui/components/states";

/**
 * The shell the four observability tabs share. Their heading is identical, so it paints
 * with the prefetched shell and only the numbers below it stream in.
 */
export function ObsLoading() {
  return (
    <>
      <PageHeader title="Observability" description="How the app, the server and the AI agents are doing, across every client." />
      <SkeletonRows rows={4} className="[&>*]:h-24" />
    </>
  );
}
