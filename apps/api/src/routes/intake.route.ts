import { intakeAnswersRequestSchema, intakeApproveRequestSchema, intakeQuestionsRequestSchema } from "@social-agent/shared";
import { Router } from "express";
import { z } from "zod";
import { IntakeController } from "@/controllers/intake.controller";
import { validateMiddleware } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/asyncHandler";

// Mounted under /brands/:brandId/intake; mergeParams keeps :brandId readable here.
const router = Router({ mergeParams: true });

const validateQuestions = validateMiddleware(z.object({ body: intakeQuestionsRequestSchema }));
const validateAnswers = validateMiddleware(z.object({ body: intakeAnswersRequestSchema }));
const validateApprove = validateMiddleware(z.object({ body: intakeApproveRequestSchema }));

router.get("/", asyncHandler(IntakeController.state));
router.post("/questions", validateQuestions, asyncHandler(IntakeController.questions));
router.put("/answers", validateAnswers, asyncHandler(IntakeController.saveAnswers));
router.post("/approve", validateApprove, asyncHandler(IntakeController.approve));

export default router;
