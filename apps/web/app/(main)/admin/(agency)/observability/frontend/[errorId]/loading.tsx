import { SkeletonRows } from "@repo/ui/components/states";

/**
 * As with a run: the header is the error being viewed, so nothing here is shared
 * between two of these pages. The shell is the shape of the page.
 */
export default function FrontendErrorLoading() {
  return (
    <>
      <div className="skeleton mb-7 h-16 rounded-xl" />
      <SkeletonRows rows={3} className="[&>*]:h-32" />
    </>
  );
}
