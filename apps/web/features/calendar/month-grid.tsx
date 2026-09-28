"use client";

import { useState } from "react";
import { format, isSameMonth, isToday } from "date-fns";
import type { PostView, Strategy } from "@/lib/types";
import { cn } from "@/lib/utils";
import { describePostKind, PostKind } from "@repo/ui/components/social/post-kind";
import { PostStateText } from "@/features/content/post-state-badge";
import { FREE_CHIP, STATE_BORDER, dayKey, freeBestTimeOnDay, postDate, shortTime } from "./calendar-model";

/** Wide screens: the month as a grid. Posts can be dragged from one day to another. */
export function MonthGrid({
  days,
  byDay,
  month,
  strategy,
  onOpen,
  onMove,
}: {
  days: Date[];
  byDay: Map<string, PostView[]>;
  month: Date;
  strategy: Strategy | null;
  onOpen: (postId: string) => void;
  onMove: (postId: string, day: Date) => void;
}) {
  const [dragOver, setDragOver] = useState<string | null>(null);

  return (
    <div className="hidden lg:block">
      <div className="grid grid-cols-7 border-b">
        {days.slice(0, 7).map((d) => (
          <div key={d.toISOString()} className="type-label px-3 py-2.5">{format(d, "EEE")}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const key = dayKey(day);
          const items = byDay.get(key) ?? [];
          const inMonth = isSameMonth(day, month);
          const freeBestTime = items.length === 0 ? freeBestTimeOnDay(strategy, day) : null;
          return (
            <div
              key={day.toISOString()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(key);
              }}
              onDragLeave={() => setDragOver((k) => (k === key ? null : k))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const postId = e.dataTransfer.getData("text/plain");
                if (postId) onMove(postId, day);
              }}
              className={cn(
                "min-h-28 min-w-0 border-b p-1.5 lg:min-h-32",
                i % 7 !== 6 && "border-r",
                i >= days.length - 7 && "border-b-0",
                !inMonth && "bg-background/60",
                dragOver === key && "bg-tint/70",
              )}
            >
              <p className={cn("mb-1 ml-auto grid size-6 place-items-center rounded-full text-xs tabular-nums", dayNumberTone(day, inMonth))}>
                {format(day, "d")}
              </p>
              {/* minmax(0,1fr): without it the column grows to fit the longest headline. */}
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-1">
                {items.map((post) => {
                  const when = postDate(post);
                  const movable = post.state !== "published";
                  return (
                    <li key={post.id} className="min-w-0">
                      <button
                        type="button"
                        draggable={movable}
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", post.id);
                        }}
                        onClick={() => onOpen(post.id)}
                        title={`${describePostKind(post)}, ${post.hook}`}
                        className={cn(
                          "pressable flex w-full min-w-0 flex-col gap-0.5 rounded-lg border-l-2 bg-card px-1.5 py-1 text-left text-xs shadow-raised hover:shadow-floating",
                          movable && "cursor-grab active:cursor-grabbing",
                          STATE_BORDER[post.state],
                        )}
                      >
                        <PostKind platform={post.platform} format={post.format} slides={post.slides} durationSec={post.durationSec} className="text-[0.625rem]" />
                        <span className="flex items-baseline gap-1 truncate">
                          {when && <span className="shrink-0 tabular-nums opacity-80">{shortTime(new Date(when))}</span>}
                          <span className="truncate font-medium">{post.hook}</span>
                        </span>
                        <PostStateText post={post} className="text-[0.625rem]" />
                      </button>
                    </li>
                  );
                })}
              </ul>
              {freeBestTime && (
                <p className={cn(FREE_CHIP, "mt-1")} title={`${freeBestTime} free best time`}>
                  <b className="font-semibold text-foreground">{freeBestTime}</b> free
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Today is marked; days spilling in from the neighbouring months stay quiet. */
function dayNumberTone(day: Date, inMonth: boolean): string {
  if (isToday(day)) return "bg-primary font-semibold text-primary-foreground";
  return inMonth ? "text-foreground" : "text-muted-foreground/60";
}
