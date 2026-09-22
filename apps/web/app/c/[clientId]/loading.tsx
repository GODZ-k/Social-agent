import { SkeletonRows } from "@repo/ui/components/states";

export default function WorkspaceLoading() {
  return <SkeletonRows rows={3} className="[&>*]:h-40" />;
}
