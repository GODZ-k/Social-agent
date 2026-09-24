import type { Platform } from "@social-agent/shared";
import type { Strategy } from "@/lib/types";

/**
 * The strategy's best posting times for one network, as picker suggestions.
 * The strategy writes them for people ("Tue 7:30am"); the picker wants "07:30".
 */
export function bestTimesFor(strategy: Strategy | undefined, platform: Platform) {
  const slots = strategy?.cadence.find((c) => c.platform === platform)?.bestTimes ?? [];
  return slots.flatMap((slot) => {
    const match = /^(\w{3})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(slot.trim());
    if (!match) return [];
    const [, day, hour, minute, meridiem] = match;
    const h = (Number(hour) % 12) + (meridiem!.toLowerCase() === "pm" ? 12 : 0);
    return [{ time: `${String(h).padStart(2, "0")}:${minute}`, hint: day }];
  });
}
