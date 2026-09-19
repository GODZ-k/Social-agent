"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "../lib/utils";
import { fieldTrigger } from "./date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const label = (value: string) => {
  const [h = 0, m = 0] = value.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

interface TimePickerProps {
  /** "HH:mm" in 24-hour time, or "" for none. The same shape a native time input uses. */
  value: string;
  onChange: (value: string) => void;
  /** Minutes between choices. */
  step?: number;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function TimePicker({ value, onChange, step = 15, placeholder = "Choose a time", disabled, ...field }: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const list = React.useRef<HTMLDivElement>(null);

  const options = React.useMemo(() => {
    const times: string[] = [];
    for (let minutes = 0; minutes < 24 * 60; minutes += step) {
      times.push(`${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`);
    }
    // A time saved off the grid (say 9:05) still has to be shown as the current choice.
    return value && !times.includes(value) ? [...times, value].sort() : times;
  }, [step, value]);

  function move(e: React.KeyboardEvent) {
    const delta = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (!delta) return;
    e.preventDefault();
    const items = [...(list.current?.querySelectorAll<HTMLButtonElement>("[role=option]") ?? [])];
    items[Math.max(0, Math.min(items.length - 1, items.indexOf(document.activeElement as HTMLButtonElement) + delta))]?.focus();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger {...field} type="button" disabled={disabled} className={fieldTrigger}>
        <Clock className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn("truncate tabular-nums", !value && "text-muted-foreground/80")}>{value ? label(value) : placeholder}</span>
      </PopoverTrigger>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) min-w-40 p-1.5"
        // Open with the current time (or 9 AM) centred and focused, not scrolled to midnight.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const target = list.current?.querySelector<HTMLButtonElement>(`[data-time="${value || "09:00"}"]`);
          target?.scrollIntoView({ block: "center" });
          target?.focus({ preventScroll: true });
        }}
      >
        <div ref={list} role="listbox" aria-label="Time" onKeyDown={move} className="max-h-64 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
          {options.map((time) => {
            const isSelected = time === value;
            return (
              <button
                key={time}
                type="button"
                role="option"
                aria-selected={isSelected}
                data-time={time}
                onClick={() => {
                  onChange(time);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center rounded-md px-3 py-2 text-left text-sm tabular-nums outline-none",
                  isSelected ? "bg-primary font-semibold text-primary-foreground" : "hover:bg-accent focus-visible:bg-accent",
                )}
              >
                {label(time)}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
