import { randomUUID } from "node:crypto";
import type { BrandRow } from "@social-agent/db";
import {
  AnswerRejectedError,
  answerProblems,
  checkFollowUps,
  checkIntakeQuestions,
  generateStructured,
  isAnswerRejected,
  questionsToReopen,
  renderQuestionsPrompt,
  renderReviewPrompt,
  tappedFacts,
  unansweredRequired,
  type IntakeContext,
} from "@social-agent/agents";
import {
  intakeQuestionListSchema,
  intakeReviewSchema,
  intakeSchema,
  type Intake,
  type IntakeApproveResponse,
  type IntakeDraft,
  type IntakeQuestion,
  type IntakeReview,
  type IntakeSession,
  type IntakeState,
  type Language,
} from "@social-agent/shared";
import { config } from "@/config/constants";
import { mastra } from "@/mastra/index";
import { accountManager } from "@/mastra/agents/team";
import { BrandsRepository } from "@/repositories/brands.repository";
import { ScansRepository } from "@/repositories/scans.repository";
import { brandNotFound, scopeFor } from "@/services/brands.service";
import { ResearchService } from "@/services/research.service";
import type { AuthUser } from "@/services/users.service";
import { AppError } from "@/utils/AppError";
import { isUuid } from "@/utils";

export class IntakeService {
    /**
     * The Account Manager's questions for this brand, written once per chat language. Asking again in
     * the same language returns the stored ones; a new language starts the intake again with a new session id.
     */
    static async questions(user: AuthUser, brandId: string, chatLanguage: Language): Promise<IntakeSession> {
        const row = await findBrand(user, brandId);
        if (row.intakeApprovedAt) throw intakeApproved();
        if (row.intakeSession?.chatLanguage === chatLanguage) return row.intakeSession;

        const questions = await writeQuestions(await contextFor(row, chatLanguage));
        const session = newSession(chatLanguage, questions);
        const saved = await BrandsRepository.replaceIntakeSession(row.id, scopeFor(user), row.intakeSession?.sessionId ?? null, {
            intakeSession: session,
            preferences: { ...row.preferences, chatLanguage },
        });
        if (saved) return session;
        // Another request stored a session meanwhile: that one stands.
        return sessionOf(await findBrand(user, brandId));
    }

    static async state(user: AuthUser, brandId: string): Promise<IntakeState> {
        return stateOf(await findBrand(user, brandId));
    }

    /** Saves answers as the owner gives them, one or many at a time. Nothing is saved if any does not fit. */
    static async saveAnswers(user: AuthUser, brandId: string, sessionId: string, answers: Record<string, string>): Promise<IntakeState> {
        const row = await findBrand(user, brandId);
        if (row.intakeApprovedAt) throw intakeApproved();
        const session = currentSession(row, sessionId);

        const problems = answerProblems(answers, session);
        if (problems.length > 0) {
            const details = problems.map((message) => ({ path: "answers", message }));
            throw new AppError("Some answers do not fit their questions.", 400, "INTAKE_ANSWERS_INVALID", details);
        }

        const updated: IntakeSession = { ...session, answers: { ...session.answers, ...answers }, updatedAt: new Date().toISOString() };
        const saved = await BrandsRepository.replaceIntakeSession(row.id, scopeFor(user), sessionId, { intakeSession: updated });
        if (!saved) throw sessionChanged();
        return stateOf(saved);
    }

    /**
     * The Account Manager reviews the answers (or the owner's later edit in Settings). Approved: the
     * intake is saved and research starts. Not approved: follow-ups once; after that, the questions to reopen.
     */
    static async approve(user: AuthUser, brandId: string, sessionId: string | undefined): Promise<IntakeApproveResponse> {
        const row = await findBrand(user, brandId);
        if (row.intakeApprovedAt) return { approved: true, research: await ResearchService.get(user, brandId) };
        if (row.intake) return approveEditedIntake(user, row, row.intake);

        const session = currentSession(row, sessionId);
        const unanswered = unansweredRequired(session);
        if (unanswered.length > 0) throw intakeIncomplete(unanswered);

        const finalRound = session.followUps.length > 0;
        const review = await reviewAnswers(await contextFor(row, session.chatLanguage), session, finalRound);
        if (review.approved) return approveWith(user, row, withTappedFacts(review.intake, session));

        if (finalRound) {
            return { approved: false, final: true, reason: review.reason, followUps: [], reopen: questionsToReopen(session, review.followUps) };
        }
        const withFollowUps: IntakeSession = { ...session, followUps: review.followUps, updatedAt: new Date().toISOString() };
        const saved = await BrandsRepository.replaceIntakeSession(row.id, scopeFor(user), session.sessionId, { intakeSession: withFollowUps });
        if (!saved) throw sessionChanged();
        return { approved: false, final: false, reason: review.reason, followUps: review.followUps, reopen: [] };
    }
}

/** The brand row itself (it carries the session), with the ownership rule applied. */
async function findBrand(user: AuthUser, brandId: string): Promise<BrandRow> {
    if (!isUuid(brandId)) throw brandNotFound();
    const row = await BrandsRepository.findById(brandId, scopeFor(user));
    if (!row) throw brandNotFound();
    return row;
}

function newSession(chatLanguage: Language, questions: IntakeQuestion[]): IntakeSession {
    return { sessionId: randomUUID(), chatLanguage, questions, answers: {}, followUps: [], updatedAt: new Date().toISOString() };
}

function sessionOf(row: BrandRow): IntakeSession {
    if (!row.intakeSession) throw new AppError("Ask for the intake questions first.", 409, "INTAKE_NOT_STARTED");
    return row.intakeSession;
}

/** The session the screen answered; a screen holding an older list is refused. */
function currentSession(row: BrandRow, sessionId: string | undefined): IntakeSession {
    const session = sessionOf(row);
    if (session.sessionId !== sessionId) throw sessionChanged();
    return session;
}

function stateOf(row: BrandRow): IntakeState {
    const approvedAt = row.intakeApprovedAt?.toISOString() ?? null;
    let status: IntakeState["status"] = "not_started";
    if (row.intakeSession) status = "in_progress";
    if (approvedAt) status = "approved";
    return { status, session: row.intakeSession ?? null, approvedAt };
}

/** What the Account Manager is told about the business: the brand kit and the pages the scan read. */
async function contextFor(row: BrandRow, chatLanguage: Language): Promise<IntakeContext> {
    const scan = await ScansRepository.findLatestDoneForBrand(row.id);
    return {
        brandName: row.name,
        industry: row.industry,
        url: row.url,
        brandKit: row.brand,
        business: row.business,
        pagesRead: scan?.pages ?? [],
        chatLanguage,
    };
}

/** Facts the owner tapped (business type, post language, goal, money range) override the model's reading. */
function withTappedFacts(draft: IntakeDraft, session: IntakeSession): IntakeDraft {
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

/** Saves the approval once (a concurrent approval that lost answers with the same research) and starts research. */
async function approveWith(user: AuthUser, row: BrandRow, draft: IntakeDraft): Promise<IntakeApproveResponse> {
    const intake = intakeSchema.parse(draft);
    const saved = await BrandsRepository.approveIntake(row.id, scopeFor(user), intake);
    if (!saved) return { approved: true, research: await ResearchService.get(user, row.id) };
    const { research } = await ResearchService.start(user, row.id);
    return { approved: true, research };
}

/**
 * The owner changed the intake in Settings after it was approved. The Account Manager reviews that edit;
 * approved, the owner's own intake is kept as they wrote it. Not approved, they fix it in Settings.
 */
async function approveEditedIntake(user: AuthUser, row: BrandRow, edited: Intake): Promise<IntakeApproveResponse> {
    const chatLanguage = row.intakeSession?.chatLanguage ?? row.preferences.chatLanguage ?? "en";
    const session = row.intakeSession ?? newSession(chatLanguage, []);
    const review = await reviewAnswers(await contextFor(row, chatLanguage), session, true, edited);
    if (review.approved) return approveWith(user, row, edited);
    return { approved: false, final: true, reason: review.reason, followUps: [], reopen: [] };
}

function rejectBadList(list: { questions: IntakeQuestion[] }): void {
    const problems = checkIntakeQuestions(list);
    if (problems.length > 0) throw new AnswerRejectedError(`Fix the question list: ${problems.join("; ")}.`);
}

/** Code's own check of a review: an approval must carry a complete intake, a rejection usable follow-ups. */
function reviewProblems(review: IntakeReview, session: IntakeSession, edited: Intake | undefined): string[] {
    if (review.approved) {
        if (edited) return [];
        const parsed = intakeSchema.safeParse(withTappedFacts(review.intake, session));
        if (parsed.success) return [];
        const fields = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
        return [`approved, but these facts are missing or invalid: ${fields}`];
    }
    const missing = review.followUps.length === 0 ? ["not approved, so ask at least one follow-up"] : [];
    return [...missing, ...checkFollowUps(review.followUps, session.questions)];
}

function rejectBadReview(session: IntakeSession, edited: Intake | undefined): (review: IntakeReview) => void {
    return (review) => {
        const problems = reviewProblems(review, session, edited);
        if (problems.length > 0) throw new AnswerRejectedError(`Fix the review: ${problems.join("; ")}.`);
    };
}

/** Account Manager call 2. A review code refuses twice fails the request instead of approving a gap. */
async function reviewAnswers(context: IntakeContext, session: IntakeSession, finalRound: boolean, edited?: Intake): Promise<IntakeReview> {
    const logger = mastra.getLogger();
    const check = rejectBadReview(session, edited);
    try {
        const review = await generateStructured(accountManager, renderReviewPrompt(context, session, finalRound, edited), intakeReviewSchema, {
            jsonPromptInjection: false,
            checkFirstAnswer: check,
            onRejected: (message) => logger.warn(`intake review: rejected, asking once more: ${message}`),
        });
        check(review);
        return review;
    } catch (error) {
        if (!isAnswerRejected(error)) throw error;
        logger.warn(`intake review: the second review was rejected too: ${error.message}`);
        throw new AppError(config.intake.REVIEW_FAILED, 502, "INTAKE_REVIEW_FAILED");
    }
}

/** Account Manager call 1. A list code refuses twice is never shown to the owner. */
async function writeQuestions(context: IntakeContext): Promise<IntakeQuestion[]> {
    const logger = mastra.getLogger();
    try {
        const list = await generateStructured(accountManager, renderQuestionsPrompt(context), intakeQuestionListSchema, {
            jsonPromptInjection: false,
            checkFirstAnswer: rejectBadList,
            onRejected: (message) => logger.warn(`intake questions: rejected, asking once more: ${message}`),
        });
        rejectBadList(list);
        return list.questions;
    } catch (error) {
        if (!isAnswerRejected(error)) throw error;
        logger.warn(`intake questions: the second list was rejected too: ${error.message}`);
        throw new AppError(config.intake.QUESTIONS_FAILED, 502, "INTAKE_QUESTIONS_FAILED");
    }
}

function intakeIncomplete(questionIds: string[]): AppError {
    const details = questionIds.map((id) => ({ path: id, message: "This question needs an answer." }));
    return new AppError("A required answer is still missing or unclear.", 400, "INTAKE_INCOMPLETE", details.length > 0 ? details : undefined);
}

function intakeApproved(): AppError {
    return new AppError("The intake is already approved.", 409, "INTAKE_APPROVED");
}

function sessionChanged(): AppError {
    return new AppError("These questions were replaced. Reload them and answer again.", 409, "INTAKE_SESSION_CHANGED");
}
