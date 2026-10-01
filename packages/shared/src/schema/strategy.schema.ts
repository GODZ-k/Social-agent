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

/** One slice of the content mix: a theme the strategy posts against. Matches `content_pillars`. */
export const contentPillarSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  /** Share of the content mix, 0-100. */
  share: z.number(),
});

/** The agent's memory of what worked, kept across strategy rewrites. Matches `learnings`. */
export const learningSchema = z.object({
  id: z.string(),
  insight: z.string(),
  evidence: z.string(),
  impact: learningImpactSchema,
  /** What the agent changes in the plan because of it. */
  change: z.string().optional(),
});
