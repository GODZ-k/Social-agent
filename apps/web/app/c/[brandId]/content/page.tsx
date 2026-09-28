import { notFound } from "next/navigation";
import { getClient, getStrategy, listContent } from "@/lib/api/server";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { ContentWorkspace } from "@/features/content/content-workspace";
import { ReviewPostSheet } from "@/features/post/review-post-sheet";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ContentPage({
  params,
  searchParams,
  basePath = "/c",
}: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
  basePath?: WorkspaceBasePath;
}) {
  const [{ brandId }, { post: postId }] = await Promise.all([params, searchParams]);
  const [client, posts, strategy] = await Promise.all([getClient(brandId), listContent(brandId), getStrategy(brandId)]);
  if (!client) notFound();

  return (
    <>
      <ContentWorkspace
        posts={posts}
        brand={client.brand}
        brandId={brandId}
        strategy={strategy}
        platforms={client.platforms}
        basePath={basePath}
      />
      {postId && <ReviewPostSheet postId={postId} />}
    </>
  );
}
