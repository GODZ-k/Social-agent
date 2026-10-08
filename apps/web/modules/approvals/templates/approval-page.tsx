import { notFound } from "next/navigation";
import { ApprovalStack } from "@/modules/approvals/components/approval-stack";
import { ReviewPostSheet } from "@/components/post/review-post-sheet";
import { getBrand, getStrategy, listReviewQueue, listSocialAccounts } from "@/lib/api/server";
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

export default async function ApprovalsPage({
  params,
  searchParams,
  basePath = routes.brand.base,
}: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
  basePath?: WorkspaceBase;
}) {
  const { brandId } = await params;
  const { post: postId } = await searchParams;
  const [brand, queue, strategy, accounts] = await Promise.all([
    getBrand(brandId),
    listReviewQueue(brandId),
    getStrategy(brandId),
    listSocialAccounts(brandId),
  ]);
  if (!brand) notFound();

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
      <ApprovalStack brandId={brandId} queue={queue} brand={brand.brand} strategy={strategy} accounts={accounts} basePath={basePath} />
      {postId && <ReviewPostSheet postId={postId} />}
    </>
  );
}
