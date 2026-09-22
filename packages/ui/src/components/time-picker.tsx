"use client";

import * as React from "react";
import { Timepicker } from "timepicker-ui-react";
import { TimepickerUI, type TimepickerOptions, type UpdateEventData } from "timepicker-ui";
import "timepicker-ui/main.css";
import { Clock } from "lucide-react";
import { cn } from "../lib/utils";
import { fieldTrigger } from "./date-picker";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "./popover";

/*
 * The clock face is timepicker-ui (https://github.com/pglejzer/timepicker-ui),
 * themed and sized with our tokens in styles/globals.css. This file is the glue:
 * our field and popover around it, the "HH:mm" value contract, suggestion chips,
 * and a haptic tick on each detent.
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** "20:30" -> "8:30 PM" */
function toLabel(value: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return "";
  const hours = Number(match[1]);
  // No leading zero on the hour: the library's setValue() silently rejects "08:30 PM".
  return `${hours % 12 || 12}:${match[2]} ${hours >= 12 ? "PM" : "AM"}`;
}

/** The library's { hour: "08", minutes: "30", type: "PM" } -> "20:30" */
function toValue(data: UpdateEventData): string | null {
  if (!data.hour || !data.minutes) return null; // its "clear" event sends all-undefined
  const hours = Number(data.hour);
  const minutes = Number(data.minutes);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const pm = data.type?.trim().toUpperCase() === "PM";
  return `${pad((hours % 12) + (pm ? 12 : 0))}:${pad(minutes)}`;
}

/** A light tap on each detent. Only Android can vibrate from a web page; elsewhere this does nothing. */
const tick = () => navigator.vibrate?.(5);

export interface TimeSuggestion {
  /** "HH:mm" */
  time: string;
  /** Short context shown beside it, e.g. "Tue". */
  hint?: string;
}

interface TimePickerProps {
  /** "HH:mm" in 24-hour time, or "" for none. The same shape a native time input uses. */
  value: string;
  onChange: (value: string) => void;
  /** One-tap times shown above the dial, e.g. when the audience is most active. */
  suggestions?: TimeSuggestion[];
  suggestionsLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function TimePicker({ value, onChange, suggestions, suggestionsLabel = "Suggested", placeholder = "Choose a time", disabled, ...field }: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger {...field} type="button" disabled={disabled} className={fieldTrigger}>
        <Clock className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn("truncate tabular-nums", !value && "text-muted-foreground/80")}>{value ? toLabel(value) : placeholder}</span>
      </PopoverTrigger>
      {/*
        Width: the library lays its header out for about 328px. On screens too short for
        header-above-dial it goes side by side (see .tp-host in globals.css), which needs more.
      */}
      <PopoverContent className="w-[22rem] max-w-[calc(100vw-1.5rem)] short:max-h-[calc(100dvh-1.5rem)] short:w-[31rem]" align="end">
        {/* Mounted only while open: the library instance is created on open and destroyed on close. */}
        <ClockPanel value={value} onChange={onChange} suggestions={suggestions} suggestionsLabel={suggestionsLabel} />
      </PopoverContent>
    </Popover>
  );
}

function ClockPanel({ value, onChange, suggestions, suggestionsLabel }: Pick<TimePickerProps, "value" | "onChange" | "suggestions" | "suggestionsLabel">) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const containerId = `tp-face-${uid}`;
  const instanceId = `tp-${uid}`;
  const host = React.useRef<HTMLDivElement>(null);

  // Must keep its identity: the wrapper rebuilds the whole picker whenever this object changes.
  const options = React.useMemo<TimepickerOptions>(
    () => ({
      clock: { type: "12h", incrementMinutes: 5, autoSwitchToMinutes: true },
      ui: {
        theme: "basic",
        // Inline: the clock renders inside our popover instead of opening its own modal on
        // <body>, so it lives inside the sheet's focus scope and needs no second backdrop.
        // Its OK/Cancel buttons stay hidden: in inline mode OK removes the clock from the page.
        inline: { enabled: true, containerId, showButtons: false },
      },
      labels: { time: "" },
      behavior: { id: instanceId, focusTrap: false },
    }),
    [containerId, instanceId],
  );

  // What the dial is known to show. Echoing our own value back would call setValue()
  // mid-drag, which swings the hand back to the hour.
  const shown = React.useRef(value);

  const handleUpdate = React.useCallback(
    (data: UpdateEventData) => {
      const next = toValue(data);
      if (next === null || next === shown.current) return;
      shown.current = next;
      tick();
      onChange(next);
    },
    [onChange],
  );

  // Changes that came from outside the dial (a suggestion chip) are pushed into it.
  React.useEffect(() => {
    if (value === shown.current) return;
    shown.current = value;
    const label = toLabel(value);
    if (label) TimepickerUI.getById(instanceId)?.setValue(label, true);
  }, [value, instanceId]);

  // The library marks its markup as a modal dialog. Inside our popover it is a group,
  // and a second aria-modal would hide the rest of the popover from screen readers.
  React.useEffect(() => {
    const node = host.current;
    if (!node) return;
    const relabel = () => {
      const modal = node.querySelector(".tp-ui-modal");
      modal?.removeAttribute("aria-modal");
      modal?.setAttribute("role", "group");
    };
    relabel();
    const observer = new MutationObserver(relabel);
    observer.observe(node, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    // On short screens Done moves up beside the chips, so the dial gets all the remaining height.
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 short:grid-cols-[minmax(0,1fr)_auto] short:items-center">
      {suggestions && suggestions.length > 0 && (
        <div>
          <p className="type-label mb-1.5 px-0.5 short:hidden">{suggestionsLabel}</p>
          <ul className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <li key={s.time + (s.hint ?? "")}>
                <button
                  type="button"
                  onClick={() => {
                    if (s.time === value) return;
                    tick();
                    onChange(s.time);
                  }}
                  aria-pressed={value === s.time}
                  className={cn(
                    "pressable rounded-full px-2.5 py-1 text-[0.8125rem] font-medium tabular-nums",
                    value === s.time ? "bg-primary text-primary-foreground" : "bg-tint text-tint-foreground hover:bg-tint-strong",
                  )}
                >
                  {toLabel(s.time)}
                  {s.hint && <span className="ml-1 font-normal opacity-75">{s.hint}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div ref={host} className="tp-host short:col-span-2 short:row-start-2">
        {/* The wrapper always renders an <input>; in inline mode it is only the library's anchor. */}
        <Timepicker options={options} defaultValue={toLabel(value) || "9:00 AM"} onUpdate={handleUpdate} readOnly tabIndex={-1} aria-hidden className="sr-only" />
        {/* The library empties this element and injects the clock, so it is rendered childless. */}
        <div id={containerId} />
      </div>

      <PopoverClose className="pressable justify-self-end rounded-full short:col-start-2 short:row-start-1 bg-primary px-4 py-1.5 text-[0.8125rem] font-medium text-primary-foreground">Done</PopoverClose>
    </div>
  );
}
