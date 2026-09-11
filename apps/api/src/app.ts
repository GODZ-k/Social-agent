import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRoute from "@/routes/health.route"
import {errorMiddleware} from "@/middlewares/error.middleware";
const app = express();

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