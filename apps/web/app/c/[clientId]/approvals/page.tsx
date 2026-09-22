import { notFound } from "next/navigation";
import { PageHeader } from "@repo/ui/components/states";
import { ApprovalStack } from "@/features/approvals/approval-stack";
import { getClient, getStrategy, listPosts } from "@/lib/api/server";

export default async function ApprovalsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const [client, posts, strategy] = await Promise.all([getClient(clientId), listPosts(clientId), getStrategy(clientId)]);
  if (!client) notFound();

  const queue = posts
    .filter((p) => p.status === "in_review")
    .sort((a, b) => (a.scheduledFor ?? "").localeCompare(b.scheduledFor ?? ""));

  return (
    <>
      <PageHeader
        title="Approvals"
        description="Read each post, then swipe right to approve or left to reject. Nothing is published without you."
      />
      <ApprovalStack clientId={clientId} queue={queue} brand={client.brand} strategy={strategy} />
    </>
  );
}
