import { PageHeader, SkeletonRows } from "@repo/ui/components/states";

export default function AdminClientsLoading() {
  return (
    <>
      <PageHeader title="Clients" description="Every business owner you manage, with what needs you first." />
      <SkeletonRows rows={5} className="[&>*]:h-16" />
    </>
  );
}
