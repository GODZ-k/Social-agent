"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, addHours, format, startOfDay } from "date-fns";
import type { Platform } from "@social-agent/shared";
import { generatePosts } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { DraftingSlot } from "@/modules/content/types";

const BATCH = 6;
/** Mock-timing only: the action itself resolves in ~2.2s (lib/api/mock/posts.ts); this
 * steps the "N of M ready" counter up over roughly that window, matching the app's other
 * simulated-delay UIs (e.g. the scan) rather than a real per-post signal. */
const TICK_MS = 350;

const STEPS: DraftingSlot["step"][] = ["Making the picture", "Writing the caption", "Next in line"];

const FORMAT_DETAIL = { reel: "10 seconds", carousel: "5 slides", image: null } as const;

function targetFor(index: number, platforms: Platform[]) {
  const day = startOfDay(addDays(new Date(), 3 + index * 2));
  const scheduledFor = addHours(day, 9 + (index % 3) * 4).toISOString();
  const postFormat = (["reel", "carousel", "image"] as const)[index % 3]!;
  const detail = FORMAT_DETAIL[postFormat];
  const platform = platforms[index % platforms.length] ?? "instagram";
  return { platform, format: postFormat, detail, scheduledFor };
}

/** Asks the agent for the next batch of posts; they land in the approval queue. */
export function useGeneratePosts(brandId: string, platforms: Platform[]) {
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const { run, isPending } = useServerAction(generatePosts, {
    success: (posts) => `${posts.length} posts drafted and sent for approval`,
    onSuccess: (posts) => setNewIds(new Set(posts.map((p) => p.id))),
  });
  const [readyCount, setReadyCount] = useState(0);

  // Reset when a run starts (React's recommended pattern for state that tracks a prop
  // change, not the effect below, which then only ever does one thing: run the tick timer).
  const [wasPending, setWasPending] = useState(isPending);
  if (isPending !== wasPending) {
    setWasPending(isPending);
    if (isPending) {
      setReadyCount(0);
      setNewIds(new Set());
    }
  }

  useEffect(() => {
    if (!isPending) return;
    const timer = setInterval(() => {
      setReadyCount((count) => (count < BATCH - 1 ? count + 1 : count));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [isPending]);

  const targets = useMemo(() => Array.from({ length: BATCH }, (_, i) => targetFor(i, platforms)), [platforms]);

  const slots: DraftingSlot[] = targets.slice(readyCount).map((target, i) => ({
    ...target,
    id: readyCount + i,
    step: STEPS[Math.min(i, STEPS.length - 1)]!,
  }));

  const remaining = BATCH - readyCount;
  const rangeLabel = `${format(new Date(targets[0]!.scheduledFor), "d")} to ${format(new Date(targets[BATCH - 1]!.scheduledFor), "d MMMM")}`;

  return {
    generate: () => run(brandId, BATCH),
    isPending,
    readyCount,
    total: BATCH,
    slots,
    newIds,
    rangeLabel,
    minutesLeft: Math.max(1, remaining),
  };
}
