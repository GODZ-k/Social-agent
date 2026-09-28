"use client";

import { useState } from "react";
import { format } from "date-fns";
import { reschedulePost } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";
import type { BestTimeSlot } from "@/lib/types";
import { DatePicker } from "@repo/ui/components/date-picker";
import { TimePicker } from "@repo/ui/components/time-picker";

interface Props {
  postId: string;
  scheduledFor: string | null;
  bestTimes: BestTimeSlot[];
}

/** "When it goes out": date and time save the moment they change, there is no separate save step. */
export function ReviewPostSchedule({ postId, scheduledFor, bestTimes }: Props) {
  const [date, setDate] = useState(scheduledFor ? format(new Date(scheduledFor), "yyyy-MM-dd") : "");
  const [time, setTime] = useState(scheduledFor ? format(new Date(scheduledFor), "HH:mm") : "");
  // Follow the server's value (a save elsewhere, a step to another post) without an effect.
  const [knownScheduledFor, setKnownScheduledFor] = useState(scheduledFor);
  if (scheduledFor !== knownScheduledFor) {
    setKnownScheduledFor(scheduledFor);
    setDate(scheduledFor ? format(new Date(scheduledFor), "yyyy-MM-dd") : "");
    setTime(scheduledFor ? format(new Date(scheduledFor), "HH:mm") : "");
  }

  const save = useServerAction(reschedulePost, { failure: "Couldn't change that." });

  function change(nextDate: string, nextTime: string) {
    setDate(nextDate);
    setTime(nextTime);
    if (nextDate && nextTime) save.run(postId, new Date(`${nextDate}T${nextTime}`).toISOString());
  }

  const weekday = date ? format(new Date(`${date}T00:00`), "EEEE") : "";

  return (
    <div id="when" className="grid gap-3 rounded-2xl p-4 shadow-[0_0_0_1px_var(--border)]">
      <p className="type-heading text-[0.9375rem]">When it goes out</p>
      <div className="grid grid-cols-2 gap-3">
        <DatePicker value={date} onChange={(next) => change(next, time)} min={format(new Date(), "yyyy-MM-dd")} disabled={save.isPending} />
        <TimePicker
          value={time}
          onChange={(next) => change(date, next)}
          suggestions={bestTimes.map((slot) => ({ time: slot.time }))}
          suggestionsLabel={weekday ? `Best times on ${weekday}` : "Best times"}
          disabled={save.isPending}
        />
      </div>
      <p className="type-label">Pick any day and time. The best times are when your customers are most active; changing it only moves this post.</p>
    </div>
  );
}
