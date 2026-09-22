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
} from "@social-agent/shared";
import { z, type ZodType } from "zod";
import { ERROR_CODES, messageOf, statusOf, type ErrorCode } from "@/openapi/error-codes";
import { healthReportSchema, operations, type Operation, type Tag, type Who } from "@/openapi/operations";
import packageJson from "../../package.json" with { type: "json" };

type JsonSchema = Record<string, unknown>;

type MediaType = {
    schema: JsonSchema;
    example?: unknown;
    examples?: Record<string, { value: unknown }>;
};

type Content = { "application/json": MediaType };

type ResponseObject = { description: string; content?: Content } | { $ref: string };

type ParameterObject = {
    name: string;
    in: "path";
    required: true;
    description: string;
    schema: JsonSchema;
};

type OperationObject = {
    operationId: string;
    tags: Tag[];
    summary: string;
    security?: Record<string, string[]>[];
    parameters?: ParameterObject[];
    requestBody?: { required: true; content: Content };
    responses: Record<string, ResponseObject>;
};

type PathItem = Partial<Record<Operation["method"], OperationObject>>;

export type OpenApiDocument = {
    openapi: "3.1.0";
    info: { title: string; version: string; description: string };
    servers: { url: string }[];
    tags: { name: Tag; description: string }[];
    paths: Record<string, PathItem>;
    components: {
        schemas: Record<string, JsonSchema>;
        responses: Record<string, ResponseObject>;
        securitySchemes: Record<string, JsonSchema>;
    };
};

/**
 * `src/app.ts` listens on `env.PORT` (4000 by default). The default is written out here because
 * `@/config/env` validates the whole environment on import and exits the process when something
 * is missing, and the document has to be generatable without a `.env`.
 */
const LOCAL_SERVER = "http://localhost:4000";

const SECURITY_SCHEME = "clerkBearer";
const ERROR_SCHEMA = "ErrorResponse";

/** The response shapes, named as the components they become. */
const RESPONSE_SCHEMAS: Record<string, ZodType> = {
    HealthReport: healthReportSchema,
    Me: meSchema,
    MeOverview: meOverviewSchema,
    Brand: brandSchema,
    Scan: scanSchema,
    AdminClient: adminClientSchema,
    AdminClientDetail: adminClientDetailSchema,
};

/** The request bodies, named as the components they become. */
const REQUEST_SCHEMAS: Record<string, ZodType> = {
    NewBrandInput: newBrandSchema,
    BrandPatch: brandPatchSchema,
    NewScanInput: newScanSchema,
    InviteClientInput: inviteClientSchema,
};

// Keyed by object identity: `ZodArray.element` is typed as the looser `$ZodType`.
const SCHEMA_NAMES = new Map<object, string>(
    [...Object.entries(RESPONSE_SCHEMAS), ...Object.entries(REQUEST_SCHEMAS)].map(([name, schema]) => [schema, name]),
);

const TAGS: { name: Tag; description: string }[] = [
    { name: "Health", description: "Whether the API and its database are up." },
    { name: "Me", description: "The signed-in person's own account." },
    { name: "Brands", description: "A brand is one website plus the social accounts managed for it." },
    { name: "Scans", description: "Reading a website to propose a brand kit." },
    { name: "Admin", description: "The agency owner's view of clients (people)." },
];

const SUCCESS_DESCRIPTIONS: Record<number, string> = {
    200: "Success.",
    201: "Created.",
    202: "Accepted.",
    204: "No content.",
};

/** `requireUser` runs before every signed-in route, and finds or creates our own user row. */
const SIGNED_IN_ERRORS: ErrorCode[] = ["UNAUTHENTICATED", "EMAIL_REQUIRED", "EMAIL_IN_USE"];

/** A validated body can fail the schema, and an unparsable one never reaches the route. */
const BODY_ERRORS: ErrorCode[] = ["VALIDATION_ERROR", "INVALID_JSON"];

/** `errorMiddleware`'s last resort: anything unexpected ends here. */
const ALWAYS_ERRORS: ErrorCode[] = ["INTERNAL_SERVER_ERROR"];

export function buildOpenApiDocument(): OpenApiDocument {
    return {
        openapi: "3.1.0",
        info: {
            title: "Cadence API",
            version: packageJson.version,
            description:
                "Every answer is an envelope: `{ success: true, data }`, or `{ success: false, error: { code, message, details? } }`. " +
                "Everything under `/api/v1` needs a Clerk session token.",
        },
        servers: [{ url: LOCAL_SERVER }],
        tags: TAGS,
        paths: buildPaths(),
        components: buildComponents(),
    };
}

function buildPaths(): Record<string, PathItem> {
    const paths: Record<string, PathItem> = {};

    for (const operation of operations) {
        const path = toOpenApiPath(operation.path);
        const item = paths[path] ?? {};
        item[operation.method] = buildOperation(operation);
        paths[path] = item;
    }

    return paths;
}

/** Express writes a path parameter as `:id`, OpenAPI as `{id}`. */
function toOpenApiPath(path: string): string {
    return path.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
}

function buildOperation(operation: Operation): OperationObject {
    const parameters = pathParameters(operation);

    return {
        operationId: operation.id,
        tags: [operation.tag],
        summary: operation.summary,
        ...(operation.who !== "public" && { security: [{ [SECURITY_SCHEME]: [] }] }),
        ...(parameters.length > 0 && { parameters }),
        ...(operation.body && {
            requestBody: { required: true, content: jsonContent(schemaFor(operation.body)) } as const,
        }),
        // Status keys are integer-like, so they come out of the object in ascending order.
        responses: { ...declaredResponses(operation), ...errorResponses(operation) },
    };
}

function pathParameters(operation: Operation): ParameterObject[] {
    return Object.entries(operation.params ?? {}).map(([token, description]) => ({
        name: token.replace(":", ""),
        in: "path" as const,
        required: true as const,
        description,
        schema: { type: "string", format: "uuid" },
    }));
}

/** A response the registry spells out: a success, or a failure that carries no error code. */
type Declared = { status: number; schema?: ZodType; description?: string; ok: boolean };

function declaredResponses(operation: Operation): Record<string, ResponseObject> {
    const responses: Record<string, ResponseObject> = {};

    for (const declared of declarationsOf(operation)) {
        responses[String(declared.status)] = declaredResponse(declared);
    }

    return responses;
}

function declarationsOf(operation: Operation): Declared[] {
    const successes = [...(operation.success ? [operation.success] : []), ...(operation.alsoSuccess ?? [])];

    return [
        ...successes.map((success) => ({ ...success, ok: true })),
        ...(operation.alsoError ?? []).map((failure) => ({ ...failure, ok: false })),
    ];
}

function declaredResponse(declared: Declared): ResponseObject {
    const description = declared.description ?? SUCCESS_DESCRIPTIONS[declared.status] ?? "Success.";
    if (!declared.schema) return { description };

    return { description, content: jsonContent(dataEnvelope(declared.ok, schemaFor(declared.schema))) };
}

/** `GET /health` sends its report with `success: false` when the database is down, so the flag varies. */
function dataEnvelope(ok: boolean, data: JsonSchema): JsonSchema {
    return {
        type: "object",
        properties: { success: { type: "boolean", const: ok }, data },
        required: ["success", "data"],
    };
}

function errorResponses(operation: Operation): Record<string, ResponseObject> {
    const byStatus = new Map<number, ErrorCode[]>();

    for (const code of errorCodesFor(operation)) {
        const status = statusOf(code);
        byStatus.set(status, [...(byStatus.get(status) ?? []), code]);
    }

    const rejectedField = firstRequiredField(operation.body);
    const responses: Record<string, ResponseObject> = {};
    for (const [status, codes] of byStatus) responses[String(status)] = errorResponse(codes, rejectedField);
    return responses;
}

/** The field the VALIDATION_ERROR example complains about: a real one, from this operation's body. */
function firstRequiredField(body: ZodType | undefined): string | undefined {
    if (!body) return undefined;
    return z.toJSONSchema(body, { target: "draft-2020-12", io: "input" }).required?.[0];
}

/** The operation's own codes, plus the ones its guards, its body and the error middleware imply. */
function errorCodesFor(operation: Operation): ErrorCode[] {
    const codes = new Set<ErrorCode>([
        ...operation.errors,
        ...guardErrors(operation.who),
        ...(operation.body ? BODY_ERRORS : []),
        ...ALWAYS_ERRORS,
    ]);

    return allErrorCodes().filter((code) => codes.has(code));
}

function guardErrors(who: Who): ErrorCode[] {
    if (who === "admin") return [...SIGNED_IN_ERRORS, "FORBIDDEN"];
    if (who === "user") return SIGNED_IN_ERRORS;
    return [];
}

/** In `ERROR_CODES` order, which is by status: the responses come out sorted. */
function allErrorCodes(): ErrorCode[] {
    return Object.keys(ERROR_CODES) as ErrorCode[];
}

/** One status can carry several codes, and OpenAPI allows only one response per status. */
function errorResponse(codes: ErrorCode[], rejectedField?: string): ResponseObject {
    const [first] = codes;
    if (!first) return { description: "Error." };
    if (codes.length === 1) return { $ref: `#/components/responses/${first}` };

    return {
        description: codes.join(" · "),
        content: {
            "application/json": {
                schema: ref(ERROR_SCHEMA),
                examples: Object.fromEntries(codes.map((code) => [code, { value: errorExample(code, rejectedField) }])),
            },
        },
    };
}

function buildComponents(): OpenApiDocument["components"] {
    return {
        schemas: { ...namedSchemas(), [ERROR_SCHEMA]: errorEnvelopeSchema() },
        responses: errorResponseComponents(),
        securitySchemes: {
            [SECURITY_SCHEME]: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "A Clerk session token, sent as `Authorization: Bearer <token>`.",
            },
        },
    };
}

function namedSchemas(): Record<string, JsonSchema> {
    return { ...convertSchemas(RESPONSE_SCHEMAS, "output"), ...convertSchemas(REQUEST_SCHEMAS, "input") };
}

/**
 * A registry conversion gives every named schema at once, with `$ref`s between them.
 * Request bodies are converted from their input side: `websiteUrlSchema` turns what the caller
 * types ("acme.com") into a URL, and a transform's output side has no JSON Schema at all.
 */
function convertSchemas(named: Record<string, ZodType>, io: "input" | "output"): Record<string, JsonSchema> {
    const registry = z.registry<{ id?: string | undefined }>();
    for (const [name, schema] of Object.entries(named)) registry.add(schema, { id: name });

    const { schemas } = z.toJSONSchema(registry, {
        target: "draft-2020-12",
        io,
        uri: (id) => `#/components/schemas/${id}`,
    });

    return Object.fromEntries(Object.entries(schemas).map(([name, schema]) => [name, asComponent(schema)]));
}

/** `$schema` and `$id` describe a standalone document, not a component of one. */
function asComponent(schema: JsonSchema): JsonSchema {
    const { $schema: _schema, $id: _id, ...rest } = schema;
    return rest;
}

/** A named schema becomes a `$ref`; a list of one becomes an array of `$ref`s. */
function schemaFor(schema: ZodType): JsonSchema {
    const name = SCHEMA_NAMES.get(schema);
    if (name) return ref(name);

    const elementName = arrayElementName(schema);
    if (elementName) return { type: "array", items: ref(elementName) };

    return asComponent(z.toJSONSchema(schema, { target: "draft-2020-12" }));
}

function arrayElementName(schema: ZodType): string | undefined {
    if (!(schema instanceof z.ZodArray)) return undefined;
    return SCHEMA_NAMES.get(schema.element);
}

function ref(name: string): JsonSchema {
    return { $ref: `#/components/schemas/${name}` };
}

function errorEnvelopeSchema(): JsonSchema {
    return {
        type: "object",
        properties: {
            success: { type: "boolean", const: false },
            error: {
                type: "object",
                properties: {
                    code: { type: "string", enum: allErrorCodes() },
                    message: { type: "string" },
                    details: {
                        type: "array",
                        description: "Which fields were rejected. Only on VALIDATION_ERROR.",
                        items: {
                            type: "object",
                            properties: { path: { type: "string" }, message: { type: "string" } },
                            required: ["path", "message"],
                        },
                    },
                },
                required: ["code", "message"],
            },
        },
        required: ["success", "error"],
    };
}

function errorResponseComponents(): Record<string, ResponseObject> {
    const responses: Record<string, ResponseObject> = {};

    for (const code of allErrorCodes()) {
        responses[code] = {
            description: `${code} — ${messageOf(code)}`,
            content: jsonContent(ref(ERROR_SCHEMA), errorExample(code)),
        };
    }

    return responses;
}

/** `rejectedField` is only known per operation, so the shared component example carries no details. */
function errorExample(code: ErrorCode, rejectedField?: string): unknown {
    const details = code === "VALIDATION_ERROR" ? validationDetails(rejectedField) : undefined;

    return {
        success: false,
        error: {
            code,
            message: messageOf(code),
            ...(details && { details }),
        },
    };
}

function validationDetails(rejectedField: string | undefined) {
    if (!rejectedField) return undefined;
    return [{ path: rejectedField, message: "This field is required." }];
}

function jsonContent(schema: JsonSchema, example?: unknown): Content {
    return { "application/json": { schema, ...(example !== undefined && { example }) } };
}
