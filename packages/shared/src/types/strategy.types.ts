import type { z } from "zod";
import type {
  audienceSegmentSchema,
  bestTimeSchema,
  cadenceEntrySchema,
  learningImpactSchema,
  strategyStatusSchema,
} from "../schema/strategy.schema.js";

export type StrategyStatus = z.infer<typeof strategyStatusSchema>;
export type LearningImpact = z.infer<typeof learningImpactSchema>;
export type BestTime = z.infer<typeof bestTimeSchema>;
export type CadenceEntry = z.infer<typeof cadenceEntrySchema>;
export type AudienceSegment = z.infer<typeof audienceSegmentSchema>;
