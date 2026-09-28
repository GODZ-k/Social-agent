"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { DatePicker } from "@repo/ui/components/date-picker";
import { TimePicker } from "@repo/ui/components/time-picker";
import { cn } from "@/lib/utils";

/** When a fixed or reconnected post goes out (FL-2): straight away, or a day and time you pick. */
export function WhenItGoesOutChoice({
  title,
  asapLabel,
  asapIso,
  value,
  onChange,
  disabled,
}: {
  title: string;
  asapLabel: string;
  /** The moment "straight away" resolves to. */
  asapIso: string;
  value: string;
  onChange: (iso: string) => void;
  disabled?: boolean;
}) {
  const [custom, setCustom] = useState(value !== asapIso);
  const [date, setDate] = useState(format(new Date(value), "yyyy-MM-dd"));
  const [time, setTime] = useState(format(new Date(value), "HH:mm"));

  function pickCustom(nextDate: string, nextTime: string) {
    setDate(nextDate);
    setTime(nextTime);
    if (nextDate && nextTime) onChange(new Date(`${nextDate}T${nextTime}`).toISOString());
  }

  return (
    <div className="grid gap-2.5">
      <p className="text-[0.8125rem] font-semibold">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setCustom(false);
            onChange(asapIso);
          }}
          className={cn(
            "pressable rounded-full px-3 py-1.5 text-[0.8125rem] font-medium",
            !custom ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent",
          )}
        >
          {asapLabel}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setCustom(true)}
          className={cn(
            "pressable inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[0.8125rem] font-medium",
            custom ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent",
          )}
        >
          <Clock className="size-3.5" /> Other time
        </button>
      </div>
      {custom && (
        <div className="grid grid-cols-2 gap-2.5">
          <DatePicker value={date} onChange={(next) => pickCustom(next, time)} min={format(new Date(), "yyyy-MM-dd")} disabled={disabled} />
          <TimePicker value={time} onChange={(next) => pickCustom(date, next)} disabled={disabled} />
        </div>
      )}
    </div>
  );
}
