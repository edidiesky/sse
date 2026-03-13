import express from "express";
import logger from "./utils/logger";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
dotenv.config();
const app = express();

app.use(
  cors({
    origin: [process.env.WEB_ORIGIN!],
    credentials: true,
  }),
);

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: Date.now() });
});

const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
  logger.info(`${process.pid} is running on port ${PORT}`);
});
