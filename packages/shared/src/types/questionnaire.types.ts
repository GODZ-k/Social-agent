import type { z } from "zod";
import type {
  businessTypeSchema,
  questionnaireDraftSchema,
  questionnaireGoalSchema,
  questionnaireKeySchema,
  questionnaireQuestionSchema,
  questionnaireReviewSchema,
  questionnaireSchema,
  questionnaireSessionSchema,
  questionnaireStateSchema,
  languageSchema,
  moneyRangeSchema,
} from "../schema/questionnaire.schema.js";

export type Language = z.infer<typeof languageSchema>;
export type BusinessType = z.infer<typeof businessTypeSchema>;
export type QuestionnaireKey = z.infer<typeof questionnaireKeySchema>;
export type QuestionnaireGoal = z.infer<typeof questionnaireGoalSchema>;
export type MoneyRange = z.infer<typeof moneyRangeSchema>;
export type Questionnaire = z.infer<typeof questionnaireSchema>;
export type QuestionnaireDraft = z.infer<typeof questionnaireDraftSchema>;
export type QuestionnaireQuestion = z.infer<typeof questionnaireQuestionSchema>;
export type QuestionnaireSession = z.infer<typeof questionnaireSessionSchema>;
export type QuestionnaireReview = z.infer<typeof questionnaireReviewSchema>;
export type QuestionnaireState = z.infer<typeof questionnaireStateSchema>;
