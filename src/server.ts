import os from "os";
import express from "express";
import cluster from "cluster";
import logger from "./utils/logger";
import cors from "cors";
import dotenv from "dotenv";
import { Worker } from "worker_threads";
import path from "path";
dotenv.config();
const app = express();
const NUM_WORKERS = 7;
// process.env.NUM_WORKERS
// ? parseInt(process.env.NUM_WORKERS)
// : os.cpus()?.length;

app.use(
  cors({
    origin: [process.env.WEB_ORIGIN!],
    credentials: true,
  }),
);

function heavyComputation(rows: number): number {
  let total = 0;
  for (let i = 0; i < rows * 1000; i++) {
    total += Math.sqrt(i);
  }
  return total;
}

app.get("/blocked", (req, res) => {
  const result = heavyComputation(1000);
  res.json({ result });
});

app.get("/non-blocked", (req, res) => {
  const worker = new Worker(
    path.resolve(__dirname, "./workers/longlived-worker.js"),
  );

  worker.on("message", (data) => {
    res.status(200).json({ data });
    worker.terminate();
  });

  worker.on("error", (err) => {
    res.status(500).json({ error: err.message });
    worker.terminate();
  });

  worker.postMessage({ rows: 1000 });
});

// NON LONG LIVED WORKER ENDPOINT
// app.get("/non-blocked", (req, res) => {
//   const worker = new Worker(
//     path.resolve(__dirname, "./workers/heavy-worker.js"),
//     {
//       workerData: { rows: 10000 },
//     },
//   );

//   worker.on("message", (data) => {
//     res.status(200).json({ data });
//   });

//   worker.on("error", (err) => {
//     res.status(500).json({ error: err.message });
//   });
// });

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: Date.now() });
});
const PORT = process.env.PORT || 3000;
app.listen(3000, () => {
  logger.info(`Worker ${process.pid} on port ${PORT}`);
});

// // expensive function
// if (cluster.isPrimary) {
//   for (let i = 0; i < NUM_WORKERS; i++) {
//     cluster.fork();
//   }
//   cluster.on("exit", (worker, code, signal) => {
//     logger.warn(`Worker ${worker.process.pid} died. Restarting...`);
//     cluster.fork();
//   });
// } else {
//   function heavyComputation(rows: number): number {
//     let total = 0;
//     for (let i = 0; i < rows * 10000; i++) {
//       total += Math.sqrt(i);
//     }
//     return total;
//   }

//   app.get("/", (req, res) => {
//     const result = heavyComputation(10000);
//     res.json({ result });
//   });

//   app.get("/health", (req, res) => {
//     res.json({ status: "ok", time: Date.now() });
//   });
//   const PORT = process.env.PORT || 3000;
//   app.listen(3000, () => {
//     logger.info(`Worker ${process.pid} on port ${PORT}`);
//   });
// }
