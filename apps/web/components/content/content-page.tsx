import { notFound } from "next/navigation";
import { getBrand, getStrategy, listContent } from "@/lib/api/server";
import type { WorkspaceBasePath } from "@/lib/workspace-path";
import { ContentWorkspace } from "@/components/content/content-workspace";
import { ReviewPostSheet } from "@/components/post/review-post-sheet";

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
  const [brand, posts, strategy] = await Promise.all([getBrand(brandId), listContent(brandId), getStrategy(brandId)]);
  if (!brand) notFound();

  return (
    <>
      <ContentWorkspace
        posts={posts}
        brand={brand.brand}
        brandId={brandId}
        strategy={strategy}
        platforms={brand.platforms}
        basePath={basePath}
      />
      {postId && <ReviewPostSheet postId={postId} />}
    </>
  );
}
