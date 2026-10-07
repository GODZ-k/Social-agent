import { SkeletonRows } from "@repo/ui/components/states";
import { ObsPageHeader } from "./obs-page-header";

/**
 * The shell the four observability tabs share. Their heading is identical, so it paints
 * with the prefetched shell and only the numbers below it stream in.
 */
export function ObsLoading() {
  return (
    <>
      <ObsPageHeader />
      <SkeletonRows rows={4} className="[&>*]:h-24" />
    </>
  );
}
