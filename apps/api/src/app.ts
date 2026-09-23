import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { MastraServer } from "@mastra/express";
import { env } from "@/config/env";
import { errorMiddleware } from "@/middlewares/error.middleware";
import healthRoute from "@/routes/health.route";
import oauthRoute from "@/routes/oauth.route";
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
}

app.use("/health", healthRoute);
// The OAuth callback has no Bearer token, so it sits outside the v1 auth chain.
app.use("/api/v1/oauth", oauthRoute);
app.use("/api/v1", v1Route);

app.use(errorMiddleware);
export default app;
