import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import jobRoute from "./routes/jobs.routes";
import { globalErrorHandler } from "./utils/errorHandler";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [process.env["WEB_ORIGIN"] ?? "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: Date.now() });
});

app.use("/api/v1/jobs", jobRoute);

app.use(globalErrorHandler);

export { app };