import { SkeletonRows } from "@repo/ui/components/states";

/**
 * No heading stands in here: this page's header is the run itself, so there is no
 * shared chrome to paint before the data. The shell is the shape of the page.
 */
export default function AgentRunLoading() {
  return (
    <>
      <div className="skeleton mb-7 h-16 rounded-xl" />
      <SkeletonRows rows={3} className="[&>*]:h-32" />
    </>
  );
}
