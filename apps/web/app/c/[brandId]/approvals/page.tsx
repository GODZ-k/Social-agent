import { notFound } from "next/navigation";
import { ApprovalStack } from "@/features/approvals/approval-stack";
import { ReviewPostSheet } from "@/features/post/review-post-sheet";
import { getClient, getStrategy, listReviewQueue, listSocialAccounts } from "@/lib/api/server";
import type { WorkspaceBasePath } from "@/lib/workspace-path";

export default async function ApprovalsPage({
  params,
  searchParams,
  basePath = "/c",
}: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
  basePath?: WorkspaceBasePath;
}) {
  const { brandId } = await params;
  const { post: postId } = await searchParams;
  const [client, queue, strategy, accounts] = await Promise.all([
    getClient(brandId),
    listReviewQueue(brandId),
    getStrategy(brandId),
    listSocialAccounts(brandId),
  ]);
  if (!client) notFound();

  return (
    <>
      {/* The subtitle is desktop-only: the tablet and phone layout fits the whole stack on one screen. */}
      <header className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 max-w-[60ch]">
          <h1 className="type-title">Approvals</h1>
          <p className="mt-2 hidden text-muted-foreground lg:block">
            Swipe right to approve, left to reject. Nothing is published without you.
          </p>
        </div>
      </header>
      <ApprovalStack brandId={brandId} queue={queue} brand={client.brand} strategy={strategy} accounts={accounts} basePath={basePath} />
      {postId && <ReviewPostSheet postId={postId} />}
    </>
  );
}
