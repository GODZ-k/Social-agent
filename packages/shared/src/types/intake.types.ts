import type { z } from "zod";
import type {
  businessTypeSchema,
  intakeDraftSchema,
  intakeGoalSchema,
  intakeKeySchema,
  intakeQuestionSchema,
  intakeReviewSchema,
  intakeSchema,
  intakeSessionSchema,
  intakeStateSchema,
  languageSchema,
  moneyRangeSchema,
} from "../schema/intake.schema.js";

export type Language = z.infer<typeof languageSchema>;
export type BusinessType = z.infer<typeof businessTypeSchema>;
export type IntakeKey = z.infer<typeof intakeKeySchema>;
export type IntakeGoal = z.infer<typeof intakeGoalSchema>;
export type MoneyRange = z.infer<typeof moneyRangeSchema>;
export type Intake = z.infer<typeof intakeSchema>;
export type IntakeDraft = z.infer<typeof intakeDraftSchema>;
export type IntakeQuestion = z.infer<typeof intakeQuestionSchema>;
export type IntakeSession = z.infer<typeof intakeSessionSchema>;
export type IntakeReview = z.infer<typeof intakeReviewSchema>;
export type IntakeState = z.infer<typeof intakeStateSchema>;
