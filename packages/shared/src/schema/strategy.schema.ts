import { z } from "zod";
import { platformSchema, timeSchema, weekdaySchema } from "./brand.schema.js";

export const strategyStatusSchema = z.enum(["draft", "active", "superseded"]);

export const learningImpactSchema = z.enum(["up", "down", "neutral"]);

/** A good moment to post. The day matters as much as the clock time. */
export const bestTimeSchema = z.object({
  day: weekdaySchema,
  time: timeSchema,
});

/** How often to post on one platform, and when. */
export const cadenceEntrySchema = z.object({
  platform: platformSchema,
  perWeek: z.number().int().min(0),
  bestTimes: z.array(bestTimeSchema),
});

export const audienceSegmentSchema = z.object({
  segment: z.string(),
  note: z.string(),
});
