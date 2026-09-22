import { PageHeader } from "@repo/ui/components/states";

export default function ApprovalsLoading() {
  return (
    <>
      <PageHeader
        title="Approvals"
        description="Read each post, then swipe right to approve or left to reject. Nothing is published without you."
      />
      <div className="skeleton mx-auto h-[clamp(22rem,calc(100dvh-26rem),40rem)] w-full max-w-[26rem] rounded-2xl lg:mx-0" />
    </>
  );
}
