import { format, isSameMonth, isToday } from "date-fns";
import { CalendarDays } from "lucide-react";
import type { BrandKit } from "@social-agent/shared";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EmptyState } from "@repo/ui/components/states";
import { PlatformIcon, StatusBadge } from "@repo/ui/components/social/platform";
import { PostArt } from "@repo/ui/components/social/post-art";
import { dayKey, postDate } from "./calendar-model";

/** Phones: only the days that have something, as an agenda. */
export function AgendaList({
  days,
  byDay,
  month,
  brand,
  onOpen,
}: {
  days: Date[];
  byDay: Map<string, Post[]>;
  month: Date;
  brand: BrandKit;
  onOpen: (postId: string) => void;
}) {
  const agenda = days.filter((d) => isSameMonth(d, month) && byDay.has(dayKey(d)));

  return (
    <div className="md:hidden">
      {agenda.length === 0 ? (
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
                    <button type="button" onClick={() => onOpen(post.id)} className="pressable flex w-full items-center gap-3 rounded-xl bg-card p-2.5 text-left shadow-raised">
                      <PostArt post={post} brand={brand} fixedAspect="aspect-square" className="w-14 shrink-0 rounded-md" />
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
  );
}
