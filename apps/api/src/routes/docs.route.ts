import { Router } from "express";
import helmet from "helmet";
import { apiReference } from "@scalar/express-api-reference";
import { buildOpenApiDocument } from "@/openapi/build";

// Built once at module load (app start), not per request: the document only changes when the
// code that describes it changes, and every caller can share the same object.
const openApiDocument = buildOpenApiDocument();

const router = Router();

router.get("/openapi.json", (_req, res) => {
    res.json(openApiDocument);
});

// Scalar's page loads its bundle from jsdelivr through an inline module script; app.ts's helmet
// CSP (script-src 'self', no inline) blocks both, leaving a blank page. This middleware is chained
// on the /docs route only (not router.use(), which would run for every request under the /api
// mount, including product routes that never reach a matching route in this router and would
// still keep the loosened header). style-src/font-src already allow this under helmet's own
// defaults (https: + 'unsafe-inline' / https: + data:), so only script-src needs it.
router.get(
    "/docs",
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: { scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"] },
    }),
    apiReference({
        url: "/api/openapi.json",
        pageTitle: "Cadence API",
    })
);

export default router;
