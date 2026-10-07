import { format, isSameMonth, isToday } from "date-fns";
import { CalendarDays } from "lucide-react";
import type { BrandKit } from "@social-agent/shared";
import type { PostView, Strategy } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EmptyState } from "@repo/ui/components/states";
import { PostArt } from "@repo/ui/components/social/post-art";
import { describePostKind, PostKind } from "@repo/ui/components/social/post-kind";
import { PostStateBadge } from "@/components/content/post-state-badge";
import { FREE_CHIP, STATE_BORDER, dayKey, freeBestTimeOnDay, postDate } from "./calendar-model";

/** Phones: the days that have a post, or a still-free best time, as an agenda. */
export function AgendaList({
  days,
  byDay,
  month,
  brand,
  strategy,
  onOpen,
}: {
  days: Date[];
  byDay: Map<string, PostView[]>;
  month: Date;
  brand: BrandKit;
  strategy: Strategy | null;
  onOpen: (postId: string) => void;
}) {
  const agenda = days
    .filter((d) => isSameMonth(d, month))
    .filter((d) => byDay.has(dayKey(d)) || freeBestTimeOnDay(strategy, d));

  return (
    <div className="lg:hidden">
      {agenda.length === 0 ? (
        <EmptyState icon={<CalendarDays />} title={`Nothing in ${format(month, "MMMM")}`} description="Approved posts appear on the day they're due to go out." />
      ) : (
        <ol className="grid gap-5">
          {agenda.map((day) => {
            const posts = byDay.get(dayKey(day)) ?? [];
            const freeBestTime = posts.length === 0 ? freeBestTimeOnDay(strategy, day) : null;
            return (
              <li key={day.toISOString()} className="grid grid-cols-[3rem_1fr] gap-3">
                <div className="pt-1 text-center">
                  <p className="type-label">{format(day, "EEE")}</p>
                  <p className={cn("type-number mx-auto grid size-9 place-items-center rounded-full text-lg", isToday(day) && "bg-primary text-primary-foreground")}>
                    {format(day, "d")}
                  </p>
                </div>
                <ul className="grid gap-2">
                  {posts.map((post) => {
                    const when = postDate(post);
                    return (
                      <li key={post.id}>
                        <button
                          type="button"
                          onClick={() => onOpen(post.id)}
                          aria-label={`${describePostKind(post)}, ${post.hook}`}
                          className={cn(
                            "pressable flex w-full items-center gap-3 rounded-xl border-l-2 bg-card p-2.5 text-left shadow-raised",
                            STATE_BORDER[post.state],
                          )}
                        >
                          <PostArt post={post} brand={brand} fixedAspect="aspect-square" className="w-14 shrink-0 rounded-md" />
                          <span className="grid min-w-0 flex-1 gap-1">
                            <span className="truncate font-medium">{post.hook}</span>
                            <PostKind platform={post.platform} format={post.format} slides={post.slides} durationSec={post.durationSec} className="text-[0.6875rem] text-muted-foreground" />
                            {when && <span className="type-label tabular-nums">{format(new Date(when), "h:mm a")}</span>}
                            <PostStateBadge post={post} className="w-fit" />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  {freeBestTime && (
                    <li className={FREE_CHIP}>
                      <b className="font-semibold text-foreground">{freeBestTime}</b> free best time
                    </li>
                  )}
                </ul>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
