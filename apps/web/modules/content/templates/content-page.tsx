import { notFound } from "next/navigation";
import { getBrand, getStrategy, listContent } from "@/lib/api/server";
import { ContentWorkspace } from "@/modules/content/components/content-workspace";
import { ReviewPostSheet } from "@/components/post/review-post-sheet";
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

export default async function ContentPage({
  params,
  searchParams,
  basePath = routes.brand.base,
}: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
  basePath?: WorkspaceBase;
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
