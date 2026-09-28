"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import type { BrandKit, Platform } from "@social-agent/shared";
import type { PostState, PostView } from "@/lib/types";
import { EmptyState } from "@repo/ui/components/states";
import { ContentToolbar, type StatusFilter } from "./content-toolbar";
import { ReviewBanner } from "./review-banner";
import { ContentTable } from "./content-table";
import { ContentCards } from "./content-cards";

/** `children` is the button that drafts the first batch, shown when the client has no posts. */
export function ContentView({
  posts,
  brand,
  children,
}: {
  posts: PostView[];
  brand: BrandKit;
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

      {visible.length === 0 ? (
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
      ) : (
        <>
          <ContentTable posts={visible} brand={brand} pathname={pathname} />
          <ContentCards posts={visible} brand={brand} pathname={pathname} />
          <p className="type-label mt-4">Soonest first. Reach and saves appear on each post a day after it&rsquo;s published.</p>
        </>
      )}
    </>
  );
}
