import { SkeletonRows } from "@repo/ui/components/states";

export default function AdminClientLoading() {
  return <SkeletonRows rows={4} className="[&>*]:h-24" />;
}
