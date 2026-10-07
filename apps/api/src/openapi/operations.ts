import {
    adminClientDetailSchema,
    adminClientSchema,
    brandPatchSchema,
    brandSchema,
    inviteClientSchema,
    meOverviewSchema,
    meSchema,
    newBrandSchema,
    newScanSchema,
    scanSchema,
    connectSocialAccountResponseSchema,
    connectSocialAccountSchema,
    questionnaireAnswersRequestSchema,
    questionnaireQuestionsRequestSchema,
    questionnaireSessionSchema,
    questionnaireStateSchema,
    questionnaireSubmitRequestSchema,
    questionnaireSubmitResponseSchema,
    researchSchema,
    socialAccountDetailSchema,
} from "@social-agent/shared";
import { z, type ZodType } from "zod";
import type { ErrorCode } from "@/openapi/error-codes";

/** Who may call an operation: nobody signed in, any signed-in person, or an admin only. */
export type Who = "public" | "user" | "admin";

export type Tag = "Health" | "Me" | "Brands" | "Admin" | "Scans" | "Questionnaire" | "Research" | "Social accounts" | "OAuth";

export type Operation = {
    /** The operation's name, and the `operationId` in the document: what code generators call it. */
    id: string;
    method: "get" | "post" | "put" | "patch" | "delete";
    /** Express style, as it is mounted: "/api/v1/brands/:id". */
    path: string;
    summary: string;
    tag: Tag;
    who: Who;
    /** ":id" -> what that id is. */
    params?: Record<string, string>;
    body?: ZodType;
    /** Left out by an operation that never answers with a success, such as `GET /health/test-error`. */
    success?: { status: 200 | 201 | 202 | 204; schema?: ZodType; description?: string };
    /** Codes this operation can throw, besides the ones `who` and `body` already imply. */
    errors: ErrorCode[];
    /** A second success the same call can give, e.g. POST /scans answering 200 for a scan already running. */
    alsoSuccess?: { status: 200; schema?: ZodType; description: string }[];
    /** A failure that is not an `AppError`, so it carries no code: `GET /health`'s 503. */
    alsoError?: { status: number; description: string; schema?: ZodType }[];
};

/**
 * `HealthService.check()`'s report. It is the only response shape with no schema in
 * `@social-agent/shared`, because nothing outside the API reads it.
 */
export const healthReportSchema = z.object({
    status: z.enum(["healthy", "unhealthy"]),
    database: z.enum(["up", "down"]),
    timestamp: z.string(),
});

export const operations: Operation[] = [
    {
        id: "getHealth",
        method: "get",
        path: "/health",
        summary: "Report whether the API is up and the database is reachable.",
        tag: "Health",
        who: "public",
        success: { status: 200, schema: healthReportSchema, description: "The API is up and the database answers." },
        alsoError: [
            {
                status: 503,
                schema: healthReportSchema,
                description:
                    "The database is unreachable. The body is the same report, with `status: \"unhealthy\"`, `database: \"down\"` and `success: false`.",
            },
        ],
        errors: [],
    },
    {
        id: "getTestError",
        method: "get",
        path: "/health/test-error",
        summary: "Throw a test error, to see the error envelope.",
        tag: "Health",
        who: "public",
        errors: ["TEST_ERROR"],
    },
    {
        id: "getMe",
        method: "get",
        path: "/api/v1/me",
        summary: "Return the signed-in person's account.",
        tag: "Me",
        who: "user",
        success: { status: 200, schema: meSchema },
        errors: [],
    },
    {
        id: "getMeOverview",
        method: "get",
        path: "/api/v1/me/overview",
        summary: "Return the signed-in person with the brands they own, for a dashboard's first paint.",
        tag: "Me",
        who: "user",
        success: { status: 200, schema: meOverviewSchema },
        errors: [],
    },
    {
        id: "listBrands",
        method: "get",
        path: "/api/v1/brands",
        summary: "List the brands the caller owns; every brand for an admin.",
        tag: "Brands",
        who: "user",
        success: { status: 200, schema: z.array(brandSchema), description: "Newest first. Archived brands are left out." },
        errors: [],
    },
    {
        id: "createBrand",
        method: "post",
        path: "/api/v1/brands",
        summary: "Create a brand for the caller, optionally from a finished scan.",
        tag: "Brands",
        who: "user",
        body: newBrandSchema,
        success: { status: 201, schema: brandSchema },
        errors: ["SCAN_NOT_FOUND", "SCAN_NOT_DONE"],
    },
    {
        id: "getBrand",
        method: "get",
        path: "/api/v1/brands/:id",
        summary: "Return one brand.",
        tag: "Brands",
        who: "user",
        params: { ":id": "The brand's id." },
        success: { status: 200, schema: brandSchema },
        errors: ["BRAND_NOT_FOUND"],
    },
    {
        id: "updateBrand",
        method: "patch",
        path: "/api/v1/brands/:id",
        summary: "Change the parts of a brand its owner may edit.",
        tag: "Brands",
        who: "user",
        params: { ":id": "The brand's id." },
        body: brandPatchSchema,
        success: { status: 200, schema: brandSchema },
        errors: ["BRAND_NOT_FOUND"],
    },
    {
        id: "archiveBrand",
        method: "delete",
        path: "/api/v1/brands/:id",
        summary: "Archive a brand.",
        tag: "Brands",
        who: "user",
        params: { ":id": "The brand's id." },
        success: {
            status: 204,
            description: "Archived: the brand leaves every list and its history stays. No body.",
        },
        errors: ["BRAND_NOT_FOUND"],
    },
    {
        id: "createScan",
        method: "post",
        path: "/api/v1/scans",
        summary: "Start a brand scan of a website.",
        tag: "Scans",
        who: "user",
        body: newScanSchema,
        success: { status: 202, schema: scanSchema, description: "Queued. Poll `GET /api/v1/scans/{id}` for the result." },
        alsoSuccess: [
            {
                status: 200,
                schema: scanSchema,
                description: "The caller's scan that is already queued or running. No second scan was started.",
            },
        ],
        errors: [],
    },
    {
        id: "getScan",
        method: "get",
        path: "/api/v1/scans/:id",
        summary: "Return one scan with its progress and, once done, its result.",
        tag: "Scans",
        who: "user",
        params: { ":id": "The scan's id." },
        success: { status: 200, schema: scanSchema },
        errors: ["SCAN_NOT_FOUND"],
    },
    {
        id: "listClients",
        method: "get",
        path: "/api/v1/admin/clients",
        summary: "List every client, with how many brands each owns.",
        tag: "Admin",
        who: "admin",
        success: { status: 200, schema: z.array(adminClientSchema) },
        errors: [],
    },
    {
        id: "inviteClient",
        method: "post",
        path: "/api/v1/admin/clients",
        summary: "Invite a client by email, creating their row before they sign in.",
        tag: "Admin",
        who: "admin",
        body: inviteClientSchema,
        success: { status: 201, schema: adminClientSchema },
        errors: ["CLIENT_EXISTS", "INVITE_FAILED"],
    },
    {
        id: "getClient",
        method: "get",
        path: "/api/v1/admin/clients/:id",
        summary: "Return one client with the brands they own.",
        tag: "Admin",
        who: "admin",
        params: { ":id": "The client's id." },
        success: { status: 200, schema: adminClientDetailSchema },
        errors: ["CLIENT_NOT_FOUND"],
    },
    {
        id: "createClientBrand",
        method: "post",
        path: "/api/v1/admin/clients/:id/brands",
        summary: "Create a brand owned by a client, on their behalf.",
        tag: "Admin",
        who: "admin",
        params: { ":id": "The client's id." },
        body: newBrandSchema,
        success: { status: 201, schema: brandSchema },
        errors: ["CLIENT_NOT_FOUND", "SCAN_NOT_FOUND", "SCAN_NOT_DONE"],
    },
    {
        id: "getQuestionnaire",
        method: "get",
        path: "/api/v1/brands/:brandId/questionnaire",
        summary: "Return the questionnaire's state: its questions, the answers so far, and whether it is approved.",
        tag: "Questionnaire",
        who: "user",
        params: { ":brandId": "The brand's id." },
        success: { status: 200, schema: questionnaireStateSchema },
        errors: ["BRAND_NOT_FOUND"],
    },
    {
        id: "createQuestionnaireQuestions",
        method: "post",
        path: "/api/v1/brands/:brandId/questionnaire/questions",
        summary: "Ask the Account Manager for a fresh set of questions, in the chat language given.",
        tag: "Questionnaire",
        who: "user",
        params: { ":brandId": "The brand's id." },
        body: questionnaireQuestionsRequestSchema,
        success: {
            status: 200,
            schema: questionnaireSessionSchema,
            description: "A new session. Its `sessionId` must be sent back with the answers.",
        },
        errors: ["BRAND_NOT_FOUND", "QUESTIONNAIRE_APPROVED", "QUESTIONNAIRE_QUESTIONS_FAILED"],
    },
    {
        id: "saveQuestionnaireAnswers",
        method: "put",
        path: "/api/v1/brands/:brandId/questionnaire/answers",
        summary: "Save answers against the session that asked the questions.",
        tag: "Questionnaire",
        who: "user",
        params: { ":brandId": "The brand's id." },
        body: questionnaireAnswersRequestSchema,
        success: { status: 200, schema: questionnaireStateSchema },
        errors: [
            "BRAND_NOT_FOUND",
            "QUESTIONNAIRE_APPROVED",
            "QUESTIONNAIRE_NOT_STARTED",
            "QUESTIONNAIRE_SESSION_CHANGED",
            "QUESTIONNAIRE_ANSWERS_INVALID",
        ],
    },
    {
        id: "submitQuestionnaire",
        method: "post",
        path: "/api/v1/brands/:brandId/questionnaire/submit",
        summary: "Submit the answers for the Account Manager to review; its approval starts research.",
        tag: "Questionnaire",
        who: "user",
        params: { ":brandId": "The brand's id." },
        body: questionnaireSubmitRequestSchema,
        success: {
            status: 200,
            schema: questionnaireSubmitResponseSchema,
            description: "The review's verdict. Approved means research has been queued.",
        },
        errors: [
            "BRAND_NOT_FOUND",
            "QUESTIONNAIRE_APPROVED",
            "QUESTIONNAIRE_NOT_STARTED",
            "QUESTIONNAIRE_SESSION_CHANGED",
            "QUESTIONNAIRE_INCOMPLETE",
            "QUESTIONNAIRE_REVIEW_FAILED",
        ],
    },
    {
        id: "startResearch",
        method: "post",
        path: "/api/v1/brands/:brandId/research",
        summary: "Start a business-discovery run for the brand.",
        tag: "Research",
        who: "user",
        params: { ":brandId": "The brand's id." },
        success: {
            status: 202,
            schema: researchSchema,
            description: "Queued. Poll `GET /api/v1/brands/{brandId}/research` for progress and the result.",
        },
        // The 409 is unusual: it carries the already-running run in `data` beside `error`, so a
        // caller can show progress instead of treating it as a dead end.
        alsoError: [
            {
                status: 409,
                schema: researchSchema,
                description:
                    "A run is already going. The body carries `error.code: \"RESEARCH_RUNNING\"` and the running run in `data`.",
            },
        ],
        errors: ["BRAND_NOT_FOUND", "QUESTIONNAIRE_REQUIRED"],
    },
    {
        id: "getResearch",
        method: "get",
        path: "/api/v1/brands/:brandId/research",
        summary: "Return the brand's research: the current run's progress, and the latest brief and audience profile.",
        tag: "Research",
        who: "user",
        params: { ":brandId": "The brand's id." },
        success: { status: 200, schema: researchSchema },
        errors: ["BRAND_NOT_FOUND"],
    },
    {
        id: "listSocialAccounts",
        method: "get",
        path: "/api/v1/brands/:brandId/social-accounts",
        summary: "List the brand's social accounts and whether each is connected.",
        tag: "Social accounts",
        who: "user",
        params: { ":brandId": "The brand's id." },
        success: { status: 200, schema: z.array(socialAccountDetailSchema) },
        errors: ["BRAND_NOT_FOUND"],
    },
    {
        id: "connectSocialAccount",
        method: "post",
        path: "/api/v1/brands/:brandId/social-accounts/connect",
        summary: "Begin connecting a platform: returns the provider's authorize URL to send the person to.",
        tag: "Social accounts",
        who: "user",
        params: { ":brandId": "The brand's id." },
        body: connectSocialAccountSchema,
        success: {
            status: 200,
            schema: connectSocialAccountResponseSchema,
            description: "Send the person to `authorizeUrl`; the provider returns them to the OAuth callback.",
        },
        errors: ["BRAND_NOT_FOUND", "PLATFORM_NOT_AVAILABLE"],
    },
    {
        id: "disconnectSocialAccount",
        method: "delete",
        path: "/api/v1/brands/:brandId/social-accounts/:platform",
        summary: "Disconnect one platform from the brand.",
        tag: "Social accounts",
        who: "user",
        params: { ":brandId": "The brand's id.", ":platform": "The platform to disconnect." },
        success: { status: 204, description: "Disconnected. No body." },
        errors: ["BRAND_NOT_FOUND", "ACCOUNT_NOT_FOUND"],
    },
    {
        id: "oauthCallback",
        method: "get",
        path: "/api/v1/oauth/:platform/callback",
        summary: "Where the provider returns the person after they authorize. Redirects back into the app.",
        tag: "OAuth",
        // Public on purpose: a redirect cannot carry a bearer token, so the signed `state` is the identity.
        who: "public",
        params: { ":platform": "The platform that is calling back." },
        alsoError: [{ status: 302, description: "Always redirects: back into the app on success, or to an error screen." }],
        errors: [],
    },
];
