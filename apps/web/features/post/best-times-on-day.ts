import { format } from "date-fns";
import type { Platform } from "@social-agent/shared";
import type { Strategy } from "@/lib/types";
import { bestTimesFor } from "@/lib/best-times";

/**
 * The strategy's best times for one platform, kept to a single day. Pure and
 * brand-safe (the strategy is already loaded), so the swipe stack and the
 * full-screen viewer can offer "change the time" without a server round trip.
 */
export function bestTimesOnDay(strategy: Strategy | null, platform: Platform, date: Date) {
  const weekday = format(date, "EEE");
  return bestTimesFor(strategy ?? undefined, platform).filter((slot) => slot.hint === weekday);
}
