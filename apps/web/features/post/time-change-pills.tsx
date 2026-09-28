"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { TimePicker } from "@repo/ui/components/time-picker";
import { cn } from "@repo/ui/lib/utils";

const timeLabel = (time: string) => format(new Date(`2000-01-01T${time}`), "h:mm a");

/** One-tap best times for the day already chosen, plus a picker for anything else. */
export function TimeChangePills({
  times,
  currentTime,
  onChange,
  disabled,
}: {
  times: string[];
  currentTime: string;
  onChange: (time: string) => void;
  disabled?: boolean;
}) {
  const [otherOpen, setOtherOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="type-label">Change the time:</span>
      {times.map((time) => (
        <button
          key={time}
          type="button"
          disabled={disabled}
          onClick={() => onChange(time)}
          className={cn(
            "pressable rounded-full px-3 py-1 text-[0.8125rem] font-medium",
            time === currentTime ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent",
          )}
        >
          {timeLabel(time)}
        </button>
      ))}
      {otherOpen ? (
        <TimePicker
          value={currentTime}
          onChange={(next) => {
            onChange(next);
            setOtherOpen(false);
          }}
          placeholder="Other time"
        />
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOtherOpen(true)}
          className="pressable inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-[0.8125rem] font-medium ring-1 ring-border hover:bg-accent"
        >
          <Clock className="size-3.5" /> Other time
        </button>
      )}
    </div>
  );
}
