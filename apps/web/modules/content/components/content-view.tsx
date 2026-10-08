"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Compass, LayoutGrid } from "lucide-react";
import type { BrandKit, Platform } from "@social-agent/shared";
import type { PostState, PostView, Strategy } from "@/lib/types";
import { Button } from "@repo/ui/components/button";
import { EmptyState } from "@repo/ui/components/states";
import { ContentToolbar } from "./content-toolbar";
import { ReviewBanner } from "./review-banner";
import { ContentTable } from "./content-table";
import { ContentCards } from "./content-cards";
import { ContentGhostRows } from "./content-ghost-rows";
import { StrategyDraftingNotice } from "./strategy-drafting-notice";
import type { DraftingSlot } from "@/modules/content/types";
import { routes, workspaceRoutes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";
import type { StatusFilter } from "@/modules/content/types";

/** How long after activation the passive "drafting" notice (ST-5) shows before falling back to the button (FL-4). */
const DRAFTING_GRACE_MS = 10 * 60 * 1000;

/** "It starts on its own in 18 minutes, or you can start it now." Past due reads as "any moment now" rather than a negative span. */
function autoStartCopy(strategy: Strategy | null): string {
  if (!strategy) return "The agent starts drafting once your strategy starts.";
  const autoStartsAt = parseISO(strategy.autoStartsAt);
  const wait = autoStartsAt > new Date() ? formatDistanceToNow(autoStartsAt) : "any moment now";
  return `The agent starts drafting once your strategy starts. It starts on its own in ${wait}, or you can start it now.`;
}

/** `children` is the button that drafts the first batch, shown once the strategy is active but nothing's drafted yet. */
export function ContentView({
  posts,
  brand,
  brandId,
  strategy,
  newIds = new Set(),
  draftingSlots = [],
  basePath = routes.brand.base,
  children,
}: {
  posts: PostView[];
  brand: BrandKit;
  brandId: string;
  strategy: Strategy | null;
  newIds?: Set<string>;
  draftingSlots?: DraftingSlot[];
  basePath?: WorkspaceBase;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [status, setStatus] = useState<StatusFilter>("");
  const [platform, setPlatform] = useState<Platform | "">("");
  const [search, setSearch] = useState("");

  const platforms = useMemo(() => [...new Set(posts.map((p) => p.platform))], [posts]);

  const counts = useMemo(() => {
    const c: Partial<Record<PostState, number>> = {};
    for (const p of posts) c[p.state] = (c[p.state] ?? 0) + 1;
    return c;
  }, [posts]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (!status || p.state === status) &&
        (!platform || p.platform === platform) &&
        (!term || p.hook.toLowerCase().includes(term) || p.theme.toLowerCase().includes(term)),
    );
  }, [posts, status, platform, search]);

  const needsApproval = counts.needs_approval ?? 0;
  const firstVisible = visible[0];
  // No strategy yet, or a drafted one still waiting to auto-start: nothing to draft posts from.
  const strategyNotStarted = posts.length === 0 && (!strategy || strategy.status === "draft");
  // Just activated (StrategyStartedBanner's own claim: "the agent is drafting your first posts
  // now") and nothing has landed yet: the passive ST-5 notice, not the button. Once that window
  // passes with still nothing drafted, the button (FL-4's real entry point) takes over below, so
  // there's always a way forward.
  const activatedAt = strategy?.activatedAt;
  const activatedRecently = activatedAt != null && new Date().getTime() - parseISO(activatedAt).getTime() < DRAFTING_GRACE_MS;
  const strategyDrafting = posts.length === 0 && strategy !== null && strategy.status === "active" && activatedRecently;

  const isEmpty = visible.length === 0 && draftingSlots.length === 0;
  let emptyContent: React.ReactNode = null;
  if (isEmpty && strategyNotStarted) {
    emptyContent = (
      <>
        <ContentGhostRows />
        <EmptyState
          icon={<Compass />}
          title="No posts yet"
          description={autoStartCopy(strategy)}
          action={
            <Button asChild>
              <Link href={workspaceRoutes(basePath).strategy(brandId)}>Review the strategy</Link>
            </Button>
          }
        />
      </>
    );
  } else if (isEmpty && strategyDrafting && strategy) {
    emptyContent = (
      <>
        <ContentGhostRows working />
        <StrategyDraftingNotice strategy={strategy} />
      </>
    );
  } else if (isEmpty) {
    emptyContent = (
      <EmptyState
        icon={<LayoutGrid />}
        title={posts.length === 0 ? "No posts yet" : "No posts match"}
        description={
          posts.length === 0
            ? "The agent drafts posts from the strategy. Ask for a first batch and they'll appear here for approval."
            : "Try a different status or clear the search."
        }
        action={posts.length === 0 ? children : undefined}
      />
    );
  }

  return (
    <>
      {status === "needs_approval" && needsApproval > 0 && firstVisible && (
        <ReviewBanner count={needsApproval} href={`${pathname}?post=${firstVisible.id}`} />
      )}

      <ContentToolbar
        status={status}
        onStatusChange={setStatus}
        platform={platform}
        onPlatformChange={setPlatform}
        platforms={platforms}
        total={posts.length}
        counts={counts}
        search={search}
        onSearchChange={setSearch}
      />

      {isEmpty ? (
        emptyContent
      ) : (
        <>
          <ContentTable posts={visible} brand={brand} pathname={pathname} newIds={newIds} draftingSlots={draftingSlots} />
          <ContentCards posts={visible} brand={brand} pathname={pathname} newIds={newIds} draftingSlots={draftingSlots} />
          <p className="type-label mt-4">Soonest first. Reach and saves appear on each post a day after it&rsquo;s published.</p>
        </>
      )}
    </>
  );
}
