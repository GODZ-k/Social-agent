import { questionnaireAnswersRequestSchema, questionnaireSubmitRequestSchema, questionnaireQuestionsRequestSchema } from "@social-agent/shared";
import { Router } from "express";
import { z } from "zod";
import { QuestionnaireController } from "@/controllers/questionnaire.controller";
import { validateMiddleware } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/asyncHandler";

// Mounted under /brands/:brandId/questionnaire; mergeParams keeps :brandId readable here.
const router = Router({ mergeParams: true });

const validateQuestions = validateMiddleware(z.object({ body: questionnaireQuestionsRequestSchema }));
const validateAnswers = validateMiddleware(z.object({ body: questionnaireAnswersRequestSchema }));
const validateSubmit = validateMiddleware(z.object({ body: questionnaireSubmitRequestSchema }));

router.get("/", asyncHandler(QuestionnaireController.state));
router.post("/questions", validateQuestions, asyncHandler(QuestionnaireController.questions));
router.put("/answers", validateAnswers, asyncHandler(QuestionnaireController.saveAnswers));
router.post("/submit", validateSubmit, asyncHandler(QuestionnaireController.submit));

export default router;
