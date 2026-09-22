import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { MastraServer } from "@mastra/express";
import { env } from "@/config/env";
import { errorMiddleware } from "@/middlewares/error.middleware";
import healthRoute from "@/routes/health.route";
import v1Route from "@/routes/v1.route";
import { mastra } from "./mastra";

const app = express();
app.use(helmet());

app.use(cors({
  origin: env.CORS_ORIGINS,
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

// Mastra's built-in routes (used by Studio) have no auth, so never mount them in production.
if (env.NODE_ENV !== "production") {
  const server = new MastraServer({ app, mastra });
  await server.init();

  // Dynamic import: docs.route.ts is dev-only tooling. A static import would drag Scalar and the
  // OpenAPI builder into the production bundle and build the document at every production boot as
  // a module side effect. (Side effect, not the reason: it also keeps /api/docs and
  // /api/openapi.json out of the static route inventory that openapi/routes.cjs reads from this file.)
  const { default: docsRoute } = await import("@/routes/docs.route");
  app.use("/api", docsRoute);
}

// Routes
app.use("/health", healthRoute);
app.use("/api/v1", v1Route);

app.use(errorMiddleware);
export default app;
