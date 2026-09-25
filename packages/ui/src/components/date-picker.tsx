"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { addDays, addMonths, format, isBefore, isSameDay, isSameMonth, isToday, parse, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { spring } from "../lib/motion";
import { cn } from "../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const ISO = "yyyy-MM-dd";
const WEEK = { weekStartsOn: 1 } as const;
const fromIso = (value: string) => parse(value, ISO, new Date());

/** The look of a text field, for controls that open something instead of taking typing. */
export const fieldTrigger =
  "pressable flex h-11 w-full items-center gap-2.5 rounded-md border border-input bg-card px-3.5 text-left text-[0.9375rem] transition-[border-color,box-shadow] duration-150 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-[state=open]:border-primary data-[state=open]:ring-4 data-[state=open]:ring-ring/30";

interface DatePickerProps {
  /** "yyyy-MM-dd", or "" for none. The same shape a native date input uses. */
  value: string;
  onChange: (value: string) => void;
  /** Earliest day that can be chosen, "yyyy-MM-dd". */
  min?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function DatePicker({ value, onChange, min, placeholder = "Choose a date", disabled, ...field }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? fromIso(value) : null;
  const earliest = min ? startOfDay(fromIso(min)) : null;

  const [month, setMonth] = React.useState(() => startOfMonth(selected ?? new Date()));
  // +1 forward in time, -1 back: decides which side the next month slides in from.
  const [direction, setDirection] = React.useState(1);
  // The day the arrow keys are on. Only this day is in the tab order (a roving tabindex).
  const [cursor, setCursor] = React.useState(() => selected ?? new Date());
  const grid = React.useRef<HTMLDivElement>(null);
  const focusCursor = React.useRef(false);

  function show(next: Date, focus = false) {
    setDirection(next > month ? 1 : -1);
    const monthStart = startOfMonth(next);
    setMonth(monthStart);
    setCursor(next);
    focusCursor.current = focus;
  }

  React.useEffect(() => {
    if (!focusCursor.current) return;
    focusCursor.current = false;
    grid.current?.querySelector<HTMLButtonElement>("[data-cursor=true]")?.focus();
  }, [cursor, month]);

  const unavailable = (day: Date) => !!earliest && isBefore(day, earliest);

  function choose(day: Date) {
    if (unavailable(day)) return;
    const date = format(day, ISO);
    onChange(date);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (step) {
      e.preventDefault();
      const next = addDays(cursor, step);
      show(next, true);
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      const next = addMonths(cursor, e.key === "PageUp" ? -1 : 1);
      show(next, true);
    }
  }

  // Always six weeks, so the popover doesn't change height from month to month.
  const first = startOfWeek(month, WEEK);
  const days = Array.from({ length: 42 }, (_, i) => addDays(first, i));

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) show(selected ?? new Date());
      }}
    >
      <PopoverTrigger {...field} type="button" disabled={disabled} className={fieldTrigger}>
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn("truncate", !selected && "text-muted-foreground/80")}>
          {selected ? format(selected, "EEE d MMM yyyy") : placeholder}
        </span>
      </PopoverTrigger>

      <PopoverContent
        className="w-[19rem]"
        // Land on the selected day rather than the first button, so arrow keys work straight away.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          grid.current?.querySelector<HTMLButtonElement>("[data-cursor=true]")?.focus();
        }}
      >
        <div className="mb-2 flex items-center justify-between gap-2 pl-1.5">
          <p className="font-display text-[1.0625rem] font-semibold tracking-[-0.015em]" aria-live="polite">
            {format(month, "MMMM yyyy")}
          </p>
          <div className="flex gap-0.5">
            <MonthButton label="Previous month" onClick={() => show(addMonths(month, -1))}><ChevronLeft /></MonthButton>
            <MonthButton label="Next month" onClick={() => show(addMonths(month, 1))}><ChevronRight /></MonthButton>
          </div>
        </div>

        <div className="grid grid-cols-7" aria-hidden>
          {days.slice(0, 7).map((d) => (
            <span key={d.toISOString()} className="type-label grid h-8 place-items-center">{format(d, "EEEEEE")}</span>
          ))}
        </div>

        <div className="overflow-hidden" ref={grid} onKeyDown={onKeyDown}>
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={month.toISOString()}
              role="grid"
              aria-label={format(month, "MMMM yyyy")}
              custom={direction}
              variants={{
                enter: (dir: number) => ({ x: `${dir * 12}%`, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (dir: number) => ({ x: `${dir * -12}%`, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={spring.snappy}
              className="grid grid-cols-7"
            >
              {days.map((day) => {
                const isSelected = !!selected && isSameDay(day, selected);
                const outside = !isSameMonth(day, month);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    role="gridcell"
                    aria-selected={isSelected}
                    aria-label={format(day, "EEEE d MMMM yyyy")}
                    data-cursor={isSameDay(day, cursor)}
                    tabIndex={isSameDay(day, cursor) ? 0 : -1}
                    disabled={unavailable(day)}
                    onClick={() => choose(day)}
                    className={cn(
                      "pressable mx-auto grid size-9 place-items-center rounded-full text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "disabled:pointer-events-none disabled:text-muted-foreground/35",
                      isSelected
                        ? "bg-primary font-semibold text-primary-foreground"
                        : cn("hover:bg-accent", outside && "text-muted-foreground/60", isToday(day) && "font-semibold text-tint-foreground ring-1 ring-primary/40 ring-inset"),
                    )}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-2 flex justify-between border-t pt-2">
          <FooterButton onClick={() => choose(new Date())} disabled={unavailable(startOfDay(new Date()))}>Today</FooterButton>
          <FooterButton onClick={() => { onChange(""); setOpen(false); }} disabled={!value}>Clear</FooterButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MonthButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="pressable grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground [&_svg]:size-4">
      {children}
    </button>
  );
}

function FooterButton(props: React.ComponentProps<"button">) {
  return <button type="button" className="pressable rounded-full px-3 py-1.5 text-[0.8125rem] font-medium text-tint-foreground hover:bg-tint disabled:pointer-events-none disabled:opacity-40" {...props} />;
}
