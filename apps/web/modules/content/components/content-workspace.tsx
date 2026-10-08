"use client";

import type { BrandKit, Platform } from "@social-agent/shared";
import type { PostView, Strategy } from "@/lib/types";
import { PageHeader } from "@repo/ui/components/states";
import { useGeneratePosts } from "@/modules/content/hooks/use-generate-posts";
import { GeneratePostsButton } from "./generate-posts-button";
import { GenerateFirstPostsButton } from "./generate-first-posts-button";
import { DraftingSummaryPanel } from "./drafting-summary-panel";
import { ContentView } from "./content-view";
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

/**
 * Owns the one `useGeneratePosts` run so the header button, the inline drafting panel and the
 * table's placeholder rows all read the same progress (FL-4) — no floating overlay, no rows
 * that don't know their own platform, format or time.
 */
export function ContentWorkspace({
  posts,
  brand,
  brandId,
  strategy,
  platforms,
  basePath = routes.brand.base,
}: {
  posts: PostView[];
  brand: BrandKit;
  brandId: string;
  strategy: Strategy | null;
  platforms: Platform[];
  basePath?: WorkspaceBase;
}) {
  const gen = useGeneratePosts(brandId, platforms);

  return (
    <>
      <PageHeader
        title="Content"
        description="Every post the agent drafted, from first draft to published."
        actions={<GeneratePostsButton onClick={gen.generate} isPending={gen.isPending} total={gen.total} />}
      />
      {gen.isPending && (
        <DraftingSummaryPanel
          readyCount={gen.readyCount}
          total={gen.total}
          slots={gen.slots}
          rangeLabel={gen.rangeLabel}
          minutesLeft={gen.minutesLeft}
        />
      )}
      <ContentView
        posts={posts}
        brand={brand}
        brandId={brandId}
        strategy={strategy}
        newIds={gen.newIds}
        draftingSlots={gen.isPending ? gen.slots : []}
        basePath={basePath}
      >
        <GenerateFirstPostsButton onClick={gen.generate} isPending={gen.isPending} total={gen.total} />
      </ContentView>
    </>
  );
}
