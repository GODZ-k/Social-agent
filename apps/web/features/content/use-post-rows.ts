import { useMemo } from "react";
import type { Post, Strategy } from "@/lib/types";

/** A post plus the fields the table sorts and searches on. */
export interface Row extends Post {
  pillarName: string;
  when: string | null;
  reach: number | null;
}

export function usePostRows(posts: Post[], strategy: Strategy | null): Row[] {
  return useMemo(() => {
    const names = new Map(strategy?.pillars.map((p) => [p.id, p.name]));
    return posts.map((p) => ({
      ...p,
      pillarName: names.get(p.pillarId) ?? "",
      when: p.publishedAt ?? p.scheduledFor,
      reach: p.metrics?.reach ?? null,
    }));
  }, [posts, strategy]);
}
