"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { postsQuery } from "@/lib/api/queries";
import { useWorkspace } from "@/hooks/use-workspace";
import type { Post, PostStatus } from "@/lib/types";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState, PageHeader } from "@/components/shell/states";
import { PlatformIcon, STATUS_LABEL, StatusBadge } from "@/components/post/platform";
import { PostArt } from "@/components/post/post-art";
import { PostSheet } from "@/components/post/post-sheet";
import { Button } from "@/components/ui/button";

const WEEK = { weekStartsOn: 1 } as const;
const dayKey = (d: Date) => format(d, "yyyy-MM-dd");
const postDate = (p: Post) => p.scheduledFor ?? p.publishedAt;

const CHIP: Record<PostStatus, string> = {
  scheduled: "bg-tint text-tint-foreground",
  approved: "bg-tint text-tint-foreground",
  published: "bg-secondary text-muted-foreground",
  in_review: "bg-warning/14 text-warning",
  draft: "border border-dashed text-muted-foreground",
  rejected: "",
};

export default function CalendarPage() {
  const { clientId, client } = useWorkspace();
  const posts = useQuery(postsQuery(clientId));
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  // +1 when moving forward in time, -1 when moving back: drives which side months enter from.
  const [direction, setDirection] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const post of posts.data ?? []) {
      const when = postDate(post);
      if (!when || post.status === "rejected") continue;
      const key = dayKey(new Date(when));
      map.set(key, [...(map.get(key) ?? []), post]);
    }
    for (const list of map.values()) list.sort((a, b) => postDate(a)!.localeCompare(postDate(b)!));
    return map;
  }, [posts.data]);

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfWeek(month, WEEK), end: endOfWeek(endOfMonth(month), WEEK) }),
    [month],
  );
  const agenda = days.filter((d) => isSameMonth(d, month) && byDay.has(dayKey(d)));

  function go(step: number) {
    setDirection(step);
    setMonth((m) => addMonths(m, step));
  }

  const openPost = posts.data?.find((p) => p.id === openId) ?? null;

  return (
    <>
      <PageHeader
        title="Calendar"
        description="What goes out and when. Open any post to change its time or wording."
        actions={
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const now = startOfMonth(new Date());
                setDirection(now > month ? 1 : -1);
                setMonth(now);
              }}
              disabled={isSameMonth(month, new Date())}
            >
              Today
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="Previous month" onClick={() => go(-1)}><ChevronLeft /></Button>
            <Button variant="outline" size="icon-sm" aria-label="Next month" onClick={() => go(1)}><ChevronRight /></Button>
          </div>
        }
      />

      {posts.error && <ErrorState error={posts.error} onRetry={() => posts.refetch()} />}

      {!posts.error && (
        <div className="overflow-x-clip">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={month.toISOString()}
              custom={direction}
              // Months sit side by side in time: the next one comes from the right and
              // goes back the way it came.
              variants={{
                enter: (dir: number) => ({ x: `${dir * 8}%`, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (dir: number) => ({ x: `${dir * -8}%`, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={spring.smooth}
            >
              <h2 className="type-heading mb-4" aria-live="polite">{format(month, "MMMM yyyy")}</h2>

              {/* Wide screens: month grid. */}
              <div className="hidden overflow-hidden rounded-xl bg-card shadow-raised md:block">
                <div className="grid grid-cols-7 border-b">
                  {days.slice(0, 7).map((d) => (
                    <div key={d.toISOString()} className="type-label px-3 py-2.5">{format(d, "EEE")}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {days.map((day, i) => {
                    const items = byDay.get(dayKey(day)) ?? [];
                    const inMonth = isSameMonth(day, month);
                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "min-h-28 min-w-0 border-b p-1.5 lg:min-h-32",
                          i % 7 !== 6 && "border-r",
                          i >= days.length - 7 && "border-b-0",
                          !inMonth && "bg-background/60",
                        )}
                      >
                        <p
                          className={cn(
                            "mb-1 ml-auto grid size-6 place-items-center rounded-full text-xs tabular-nums",
                            isToday(day) ? "bg-primary font-semibold text-primary-foreground" : inMonth ? "text-foreground" : "text-muted-foreground/60",
                          )}
                        >
                          {format(day, "d")}
                        </p>
                        {posts.isPending && inMonth && i % 3 === 0 && <div className="skeleton h-6" />}
                        {/* minmax(0,1fr): without it the column grows to fit the longest headline. */}
                        <ul className="grid grid-cols-[minmax(0,1fr)] gap-1">
                          {items.map((post) => (
                            <li key={post.id} className="min-w-0">
                              <button
                                type="button"
                                onClick={() => setOpenId(post.id)}
                                title={`${post.hook} (${STATUS_LABEL[post.status]})`}
                                className={cn("pressable flex w-full items-center gap-1.5 rounded-sm px-1.5 py-1 text-left text-xs", CHIP[post.status])}
                              >
                                <PlatformIcon platform={post.platform} className="size-3" />
                                <span className="shrink-0 tabular-nums opacity-80">{format(new Date(postDate(post)!), "h:mma").toLowerCase()}</span>
                                <span className="truncate font-medium">{post.hook}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Phones: only the days that have something, as an agenda. */}
              <div className="md:hidden">
                {posts.isPending ? (
                  <div className="grid gap-3">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
                ) : agenda.length === 0 ? (
                  <EmptyState icon={<CalendarDays />} title={`Nothing in ${format(month, "MMMM")}`} description="Approved posts appear on the day they're due to go out." />
                ) : (
                  <ol className="grid gap-5">
                    {agenda.map((day) => (
                      <li key={day.toISOString()} className="grid grid-cols-[3rem_1fr] gap-3">
                        <div className="pt-1 text-center">
                          <p className="type-label">{format(day, "EEE")}</p>
                          <p className={cn("type-number mx-auto grid size-9 place-items-center rounded-full text-lg", isToday(day) && "bg-primary text-primary-foreground")}>
                            {format(day, "d")}
                          </p>
                        </div>
                        <ul className="grid gap-2">
                          {byDay.get(dayKey(day))!.map((post) => (
                            <li key={post.id}>
                              <button type="button" onClick={() => setOpenId(post.id)} className="pressable flex w-full items-center gap-3 rounded-xl bg-card p-2.5 text-left shadow-raised">
                                {client && <PostArt post={post} brand={client.brand} fixedAspect="aspect-square" className="w-14 shrink-0 rounded-md" />}
                                <span className="grid min-w-0 flex-1 gap-1">
                                  <span className="truncate font-medium">{post.hook}</span>
                                  <span className="type-label flex items-center gap-1.5 tabular-nums">
                                    <PlatformIcon platform={post.platform} className="size-3.5" />
                                    {format(new Date(postDate(post)!), "h:mm a")}
                                  </span>
                                </span>
                                <StatusBadge status={post.status} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <PostSheet post={openPost} brand={client?.brand} clientId={clientId} onClose={() => setOpenId(null)} />
    </>
  );
}
