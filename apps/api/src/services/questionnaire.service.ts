import { randomUUID } from "node:crypto";
import type { BrandRow } from "@social-agent/db";
import { answerProblems, questionsToReopen, unansweredRequired, type QuestionnaireContext } from "@social-agent/agents";
import {
  questionnaireSchema,
  type Questionnaire,
  type QuestionnaireSubmitResponse,
  type QuestionnaireDraft,
  type QuestionnaireQuestion,
  type QuestionnaireSession,
  type QuestionnaireState,
  type Language,
} from "@social-agent/shared";
import { reviewAnswers, withTappedFacts, writeQuestions } from "@/questionnaire/account-manager-calls";
import { BrandsRepository } from "@/repositories/brands.repository";
import { ScansRepository } from "@/repositories/scans.repository";
import { BrandsService } from "@/services/brands.service";
import { ResearchService } from "@/services/research.service";
import type { AuthUser } from "@/services/users.service";
import { AppError } from "@/utils/AppError";

export class QuestionnaireService {
    /**
     * The Account Manager's questions for this brand, written once per chat language. Asking again in
     * the same language returns the stored ones; a new language starts the questionnaire again with a new session id.
     */
    static async questions(user: AuthUser, brandId: string, chatLanguage: Language): Promise<QuestionnaireSession> {
        const row = await BrandsService.findRow(user, brandId);
        if (row.questionnaireApprovedAt) throw questionnaireApproved();
        if (row.questionnaireSession?.chatLanguage === chatLanguage) return row.questionnaireSession;
        const context = await contextFor(row, chatLanguage);
        const questions = await writeQuestions(context);
        const session = newSession(chatLanguage, questions);
        const saved = await BrandsRepository.replaceQuestionnaireSession(row.id, row.questionnaireSession?.sessionId ?? null, {
            questionnaireSession: session,
            preferences: { ...row.preferences, chatLanguage },
        });
        if (saved) return session;
        // Another request stored a session meanwhile: that one stands.
        const fresh = await BrandsService.findRow(user, brandId);
        return sessionFor(fresh, fresh.questionnaireSession?.sessionId);
    }

    static async state(user: AuthUser, brandId: string): Promise<QuestionnaireState> {
        const row = await BrandsService.findRow(user, brandId);
        return stateOf(row);
    }

    /** Saves answers as the owner gives them, one or many at a time. Nothing is saved if any does not fit. */
    static async saveAnswers(user: AuthUser, brandId: string, sessionId: string, answers: Record<string, string>): Promise<QuestionnaireState> {
        const row = await BrandsService.findRow(user, brandId);
        if (row.questionnaireApprovedAt) throw questionnaireApproved();
        const session = sessionFor(row, sessionId);

        const problems = answerProblems(answers, session);
        if (problems.length > 0) {
            const details = problems.map((message) => ({ path: "answers", message }));
            throw new AppError("Some answers do not fit their questions.", 400, "QUESTIONNAIRE_ANSWERS_INVALID", details);
        }

        const updated: QuestionnaireSession = { ...session, answers: { ...session.answers, ...answers }, updatedAt: new Date().toISOString() };
        const saved = await BrandsRepository.replaceQuestionnaireSession(row.id, sessionId, { questionnaireSession: updated });
        if (!saved) throw sessionChanged();
        return stateOf(saved);
    }

    /**
     * The Account Manager reviews the answers (or the owner's later edit in Settings). Approved: the
     * questionnaire is saved and research starts. Not approved: follow-ups once; after that, the questions to reopen.
     */
    static async submit(user: AuthUser, brandId: string, sessionId: string | undefined): Promise<QuestionnaireSubmitResponse> {
        const row = await BrandsService.findRow(user, brandId);
        if (row.questionnaireApprovedAt) return { approved: true, research: await ResearchService.get(user, brandId) };
        if (row.questionnaire) return approveEditedQuestionnaire(user, row, row.questionnaire);

        const session = sessionFor(row, sessionId);
        const unanswered = unansweredRequired(session);
        if (unanswered.length > 0) throw questionnaireIncomplete(unanswered);

        const finalRound = session.followUps.length > 0;
        const context = await contextFor(row, session.chatLanguage);
        const review = await reviewAnswers(context, session, finalRound);
        if (review.approved) {
            const draft = withTappedFacts(review.questionnaire, session);
            return approveWith(user, row, draft);
        }

        if (finalRound) {
            return { approved: false, final: true, reason: review.reason, followUps: [], reopen: questionsToReopen(session, review.followUps) };
        }
        const withFollowUps: QuestionnaireSession = { ...session, followUps: review.followUps, updatedAt: new Date().toISOString() };
        const saved = await BrandsRepository.replaceQuestionnaireSession(row.id, session.sessionId, { questionnaireSession: withFollowUps });
        if (!saved) throw sessionChanged();
        return { approved: false, final: false, reason: review.reason, followUps: review.followUps, reopen: [] };
    }
}

function newSession(chatLanguage: Language, questions: QuestionnaireQuestion[]): QuestionnaireSession {
    return { sessionId: randomUUID(), chatLanguage, questions, answers: {}, followUps: [], updatedAt: new Date().toISOString() };
}

/** The session the screen answered; a screen holding an older list is refused. */
function sessionFor(row: BrandRow, sessionId: string | undefined): QuestionnaireSession {
    const session = row.questionnaireSession;
    if (!session) throw new AppError("Ask for the questionnaire first.", 409, "QUESTIONNAIRE_NOT_STARTED");
    if (session.sessionId !== sessionId) throw sessionChanged();
    return session;
}

function stateOf(row: BrandRow): QuestionnaireState {
    const approvedAt = row.questionnaireApprovedAt?.toISOString() ?? null;
    let status: QuestionnaireState["status"] = "not_started";
    if (row.questionnaireSession) status = "in_progress";
    if (approvedAt) status = "approved";
    return { status, session: row.questionnaireSession ?? null, approvedAt };
}

/** What the Account Manager is told about the business: the brand kit and the pages the scan read. */
async function contextFor(row: BrandRow, chatLanguage: Language): Promise<QuestionnaireContext> {
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

/** Saves the approval once (a concurrent approval that lost answers with the same research) and starts research. */
async function approveWith(user: AuthUser, row: BrandRow, draft: QuestionnaireDraft): Promise<QuestionnaireSubmitResponse> {
    const questionnaire = questionnaireSchema.parse(draft);
    const saved = await BrandsRepository.approveQuestionnaire(row.id, questionnaire);
    if (!saved) return { approved: true, research: await ResearchService.get(user, row.id) };
    const { research } = await ResearchService.start(user, row.id);
    return { approved: true, research };
}

/**
 * The owner changed the questionnaire in Settings after it was approved. The Account Manager reviews that edit;
 * approved, the owner's own questionnaire is kept as they wrote it. Not approved, they fix it in Settings.
 */
async function approveEditedQuestionnaire(user: AuthUser, row: BrandRow, edited: Questionnaire): Promise<QuestionnaireSubmitResponse> {
    const chatLanguage = row.questionnaireSession?.chatLanguage ?? row.preferences.chatLanguage ?? "en";
    const session = row.questionnaireSession ?? newSession(chatLanguage, []);
    const context = await contextFor(row, chatLanguage);
    const review = await reviewAnswers(context, session, true, edited);
    if (review.approved) return approveWith(user, row, edited);
    return { approved: false, final: true, reason: review.reason, followUps: [], reopen: [] };
}

function questionnaireIncomplete(questionIds: string[]): AppError {
    const details = questionIds.map((id) => ({ path: id, message: "This question needs an answer." }));
    return new AppError("A required answer is still missing or unclear.", 400, "QUESTIONNAIRE_INCOMPLETE", details.length > 0 ? details : undefined);
}

function questionnaireApproved(): AppError {
    return new AppError("The questionnaire is already approved.", 409, "QUESTIONNAIRE_APPROVED");
}

function sessionChanged(): AppError {
    return new AppError("These questions were replaced. Reload them and answer again.", 409, "QUESTIONNAIRE_SESSION_CHANGED");
}
