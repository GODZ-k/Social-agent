"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { addMonths, format, startOfMonth } from "date-fns";
import type { BrandKit, Post, Strategy } from "@/lib/types";
import { spring } from "@repo/ui/lib/motion";
import { PageHeader } from "@repo/ui/components/states";
import { PostSheet } from "@/features/post/post-sheet";
import { AgendaList } from "./agenda-list";
import { groupByDay, monthDays } from "./calendar-model";
import { MonthGrid } from "./month-grid";
import { MonthNav } from "./month-nav";

export function CalendarView({ posts, brand, strategy }: { posts: Post[]; brand: BrandKit; strategy: Strategy | null }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  // +1 when moving forward in time, -1 when moving back: drives which side months enter from.
  const [direction, setDirection] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const byDay = useMemo(() => groupByDay(posts), [posts]);
  const days = useMemo(() => monthDays(month), [month]);

  function go(step: 1 | -1) {
    setDirection(step);
    setMonth((m) => addMonths(m, step));
  }

  function goToday() {
    const now = startOfMonth(new Date());
    setDirection(now > month ? 1 : -1);
    setMonth(now);
  }

  const openPost = posts.find((p) => p.id === openId) ?? null;

  return (
    <>
      <PageHeader
        title="Calendar"
        description="What goes out and when. Open any post to change its time or wording."
        actions={<MonthNav month={month} onToday={goToday} onStep={go} />}
      />

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
            <MonthGrid days={days} byDay={byDay} month={month} onOpen={setOpenId} />
            <AgendaList days={days} byDay={byDay} month={month} brand={brand} onOpen={setOpenId} />
          </motion.div>
        </AnimatePresence>
      </div>

      <PostSheet post={openPost} brand={brand} strategy={strategy} onClose={() => setOpenId(null)} />
    </>
  );
}
