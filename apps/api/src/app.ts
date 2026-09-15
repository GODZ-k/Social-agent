import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRoute from "@/routes/health.route"
import {errorMiddleware} from "@/middlewares/error.middleware";
import { MastraServer } from '@mastra/express'
import { mastra } from './ai'

const app = express();
const server = new MastraServer({ app, mastra })
await server.init()

app.use(helmet());

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/health", healthRoute);

app.use(errorMiddleware);
export default app;