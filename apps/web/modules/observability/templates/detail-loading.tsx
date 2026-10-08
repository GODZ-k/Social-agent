import { SkeletonRows } from "@repo/ui/components/states";

/**
 * A run and a frontend error share this one: on both, the header is the thing being viewed, so
 * there is no shared chrome to paint before the data arrives. The shell is the shape of the page.
 */
export function ObsDetailLoading() {
  return (
    <>
      <div className="skeleton mb-7 h-16 rounded-xl" />
      <SkeletonRows rows={3} className="[&>*]:h-32" />
    </>
  );
}
