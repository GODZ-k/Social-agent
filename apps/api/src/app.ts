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

const server = new MastraServer({ app, mastra });
await server.init();

// Routes
app.use("/health", healthRoute);
app.use("/api/v1", v1Route);

app.use(errorMiddleware);
export default app;
