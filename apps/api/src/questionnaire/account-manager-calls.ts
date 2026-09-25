import {
  AnswerRejectedError,
  checkFollowUps,
  checkQuestionnaireQuestions,
  generateStructured,
  isAnswerRejected,
  renderQuestionsPrompt,
  renderReviewPrompt,
  tappedFacts,
  type QuestionnaireContext,
} from "@social-agent/agents";
import {
  questionnaireQuestionListSchema,
  questionnaireReviewSchema,
  questionnaireSchema,
  type Questionnaire,
  type QuestionnaireDraft,
  type QuestionnaireQuestion,
  type QuestionnaireReview,
  type QuestionnaireSession,
} from "@social-agent/shared";
import { config } from "@/config/constants";
import { accountManager } from "@/mastra/agents/team";
import { mastra } from "@/mastra/index";
import { AppError } from "@/utils/AppError";

// The Account Manager's two model calls and the code checks on its answers. QuestionnaireService runs the flow.

/** Facts the owner tapped (business type, post language, goal, money range) override the model's reading. */
export function withTappedFacts(draft: QuestionnaireDraft, session: QuestionnaireSession): QuestionnaireDraft {
    const tapped = tappedFacts(session);
    const goal = tapped.goalKind ? { ...draft.goal, kind: tapped.goalKind } : draft.goal;
    return {
        ...draft,
        ...(tapped.businessType ? { businessType: tapped.businessType } : {}),
        ...(tapped.postLanguage ? { postLanguage: tapped.postLanguage } : {}),
        ...(tapped.orderValue ? { orderValue: tapped.orderValue } : {}),
        ...(goal ? { goal } : {}),
    };
}

function rejectBadList(list: { questions: QuestionnaireQuestion[] }): void {
    const problems = checkQuestionnaireQuestions(list);
    if (problems.length > 0) throw new AnswerRejectedError(`Fix the question list: ${problems.join("; ")}.`);
}

/** Code's own check of a review: an approval must carry a complete questionnaire, a rejection usable follow-ups. */
function reviewProblems(review: QuestionnaireReview, session: QuestionnaireSession, edited: Questionnaire | undefined): string[] {
    if (review.approved) {
        if (edited) return [];
        const draft = withTappedFacts(review.questionnaire, session);
        const parsed = questionnaireSchema.safeParse(draft);
        if (parsed.success) return [];
        const fields = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
        return [`approved, but these facts are missing or invalid: ${fields}`];
    }
    const missing = review.followUps.length === 0 ? ["not approved, so ask at least one follow-up"] : [];
    return [...missing, ...checkFollowUps(review.followUps, session.questions)];
}

function rejectBadReview(session: QuestionnaireSession, edited: Questionnaire | undefined): (review: QuestionnaireReview) => void {
    return (review) => {
        const problems = reviewProblems(review, session, edited);
        if (problems.length > 0) throw new AnswerRejectedError(`Fix the review: ${problems.join("; ")}.`);
    };
}

/** Account Manager call 2. A review code refuses twice fails the request instead of approving a gap. */
export async function reviewAnswers(context: QuestionnaireContext, session: QuestionnaireSession, finalRound: boolean, edited?: Questionnaire): Promise<QuestionnaireReview> {
    const logger = mastra.getLogger();
    const check = rejectBadReview(session, edited);
    try {
        const prompt = renderReviewPrompt(context, session, finalRound, edited);
        const review = await generateStructured(accountManager, prompt, questionnaireReviewSchema, {
            jsonPromptInjection: false,
            checkFirstAnswer: check,
            onRejected: (message) => logger.warn(`questionnaire review: rejected, asking once more: ${message}`),
        });
        check(review);
        return review;
    } catch (error) {
        if (!isAnswerRejected(error)) throw error;
        logger.warn(`questionnaire review: the second review was rejected too: ${error.message}`);
        throw new AppError(config.questionnaire.REVIEW_FAILED, 502, "QUESTIONNAIRE_REVIEW_FAILED");
    }
}

/** Account Manager call 1. A list code refuses twice is never shown to the owner. */
export async function writeQuestions(context: QuestionnaireContext): Promise<QuestionnaireQuestion[]> {
    const logger = mastra.getLogger();
    try {
        const prompt = renderQuestionsPrompt(context);
        const list = await generateStructured(accountManager, prompt, questionnaireQuestionListSchema, {
            jsonPromptInjection: false,
            checkFirstAnswer: rejectBadList,
            onRejected: (message) => logger.warn(`questionnaire questions: rejected, asking once more: ${message}`),
        });
        rejectBadList(list);
        return list.questions;
    } catch (error) {
        if (!isAnswerRejected(error)) throw error;
        logger.warn(`questionnaire questions: the second list was rejected too: ${error.message}`);
        throw new AppError(config.questionnaire.QUESTIONS_FAILED, 502, "QUESTIONNAIRE_QUESTIONS_FAILED");
    }
}
