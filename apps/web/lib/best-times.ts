import type { Platform } from "@social-agent/shared";
import type { Strategy } from "@/lib/types";

/** A strategy writes its best times for people, as written: "Tue 7:30am". */
export interface TimeSlot {
  /** As written: "Tue". */
  day: string;
  /** As written, 1-12: "7" or "12". */
  hour: string;
  minute: string;
  meridiem: "am" | "pm";
}

const SLOT_PATTERN = /^(\w{3})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i;

/** Parses one best-time string ("Tue 7:30am"); null when it isn't one. Shared with the mock's calendar. */
export function parseTimeSlot(slot: string): TimeSlot | null {
  const match = SLOT_PATTERN.exec(slot.trim());
  if (!match) return null;
  const [, day, hour, minute, meridiem] = match;
  return { day: day!, hour: hour!, minute: minute!, meridiem: meridiem!.toLowerCase() as "am" | "pm" };
}

/** "7:30am" -> "07:30" (24-hour clock), for pickers that want a sortable time. */
export function time24Of(slot: TimeSlot): string {
  const hour = (Number(slot.hour) % 12) + (slot.meridiem === "pm" ? 12 : 0);
  return `${String(hour).padStart(2, "0")}:${slot.minute}`;
}

/**
 * The strategy's best posting times for one network, as picker suggestions.
 * The strategy writes them for people ("Tue 7:30am"); the picker wants "07:30".
 */
export function bestTimesFor(strategy: Strategy | undefined, platform: Platform) {
  const slots = strategy?.cadence.find((c) => c.platform === platform)?.bestTimes ?? [];
  return slots.flatMap((slot) => {
    const parsed = parseTimeSlot(slot);
    return parsed ? [{ time: time24Of(parsed), hint: parsed.day }] : [];
  });
}
