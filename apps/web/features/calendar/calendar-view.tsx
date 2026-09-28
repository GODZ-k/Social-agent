"use client";

import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { addMonths, format, getHours, getMinutes, parseISO, setHours, setMinutes, startOfMonth } from "date-fns";
import { toast } from "sonner";
import type { BrandKit, Platform } from "@social-agent/shared";
import type { PostView, Strategy } from "@/lib/types";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";
import { reschedulePost } from "@/lib/api/actions";
import { spring } from "@repo/ui/lib/motion";
import { PageHeader, Panel } from "@repo/ui/components/states";
import { LazyPostSheet } from "@/features/post/lazy-post-sheet";
import { AgendaList } from "./agenda-list";
import { CalendarLegend } from "./calendar-legend";
import { CalendarNotConnectedAlert } from "./calendar-not-connected-alert";
import { CalendarPlatformFilter } from "./calendar-platform-filter";
import { EmptyMonthNote } from "./empty-month-note";
import { freeDayCount, groupByDay, monthDays, monthSummary, postsInMonth, waitingPlatforms } from "./calendar-model";
import { MonthGrid } from "./month-grid";
import { MonthNav } from "./month-nav";

/** Same time of day, moved to the dropped-on date. */
function sameTimeOn(original: Date, day: Date): Date {
  return setMinutes(setHours(day, getHours(original)), getMinutes(original));
}

export function CalendarView({
  posts,
  brand,
  strategy,
  platforms,
  brandId,
  basePath = "/c",
}: {
  posts: PostView[];
  brand: BrandKit;
  strategy: Strategy | null;
  platforms: Platform[];
  brandId: string;
  basePath?: WorkspaceBasePath;
}) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  // +1 when moving forward in time, -1 when moving back: drives which side months enter from.
  const [direction, setDirection] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform | "">("");
  const [, startMove] = useTransition();

  const visiblePosts = useMemo(() => (platform ? posts.filter((p) => p.platform === platform) : posts), [posts, platform]);
  const byDay = useMemo(() => groupByDay(visiblePosts), [visiblePosts]);
  const days = useMemo(() => monthDays(month), [month]);

  const monthPosts = useMemo(() => postsInMonth(visiblePosts, month), [visiblePosts, month]);
  const monthFreeCount = useMemo(() => freeDayCount(days, month, byDay, strategy), [days, month, byDay, strategy]);
  const summary = useMemo(() => monthSummary(monthPosts, monthFreeCount), [monthPosts, monthFreeCount]);
  const disconnectedPlatforms = useMemo(() => waitingPlatforms(posts), [posts]);

  function go(step: 1 | -1) {
    setDirection(step);
    setMonth((m) => addMonths(m, step));
  }

  function goToday() {
    const now = startOfMonth(new Date());
    setDirection(now > month ? 1 : -1);
    setMonth(now);
  }

  function reschedule(postId: string, when: string, onMoved?: () => void) {
    startMove(async () => {
      const result = await reschedulePost(postId, when);
      if (!result.ok) {
        toast.error(`Couldn't move that post. ${result.message}`);
        return;
      }
      onMoved?.();
    });
  }

  function handleMove(postId: string, day: Date) {
    const post = posts.find((p) => p.id === postId);
    if (!post || post.state === "published") return;
    const originalIso = post.scheduledFor;
    const original = originalIso ? parseISO(originalIso) : day;
    const when = sameTimeOn(original, day);
    reschedule(postId, when.toISOString(), () => {
      toast(`Moved to ${format(when, "EEEE d MMMM, h:mm a")}.`, {
        description: "It still needs your approval.",
        action: originalIso ? { label: "Undo", onClick: () => reschedule(postId, originalIso) } : undefined,
      });
    });
  }

  const openPost = posts.find((p) => p.id === openId) ?? null;

  return (
    <>
      <PageHeader
        title="Calendar"
        description="What goes out and when. Open any post to change its time or wording."
        actions={<CalendarPlatformFilter platform={platform} onChange={setPlatform} platforms={platforms} />}
      />

      <CalendarNotConnectedAlert waitingPlatforms={disconnectedPlatforms} brandId={brandId} basePath={basePath} />

      <Panel>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <h2 className="type-heading" aria-live="polite">{format(month, "MMMM yyyy")}</h2>
          <MonthNav month={month} onToday={goToday} onStep={go} />
        </div>
        <CalendarLegend className="mb-2 hidden md:flex" />
        {monthPosts.length === 0 ? (
          <EmptyMonthNote
            monthLabel={format(month, "MMMM")}
            freeCount={monthFreeCount}
            contentHref={workspaceHref(basePath, brandId, "/content")}
          />
        ) : (
          <p className="mb-4 max-w-[70ch] text-sm text-muted-foreground">{summary}</p>
        )}

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
              <MonthGrid days={days} byDay={byDay} month={month} strategy={strategy} onOpen={setOpenId} onMove={handleMove} />
              <AgendaList days={days} byDay={byDay} month={month} brand={brand} strategy={strategy} onOpen={setOpenId} />
            </motion.div>
          </AnimatePresence>
        </div>
      </Panel>

      <LazyPostSheet post={openPost} brand={brand} strategy={strategy} onClose={() => setOpenId(null)} />
    </>
  );
}
