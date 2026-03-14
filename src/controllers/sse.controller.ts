import { jobStore } from "../domain/job.store";
import { connectionStore } from "../sse/connection.store";
import { initSSEResponse, writeSSEHeartbeat } from "../sse/see.writer";
import { AppError } from "../utils/AppError";
import { randomUUID } from "crypto";
import { NextFunction, Response, Request } from "express";

class SSEController {
  /**
   * GET /api/v1/jobs/:id/events
   */
  streamJob = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const jobId = req.params["id"] as string;

      const job = jobStore.find(jobId);
      if (!job) {
        throw AppError.notFound(`Job ${jobId}`);
      }

      if (job.status === "complete" || job.status === "error") {
        res.status(200).json({
          message: `Job already ${job.status}`,
          status: job.status,
        });
        return;
      }

      initSSEResponse(res);

      const connId = randomUUID();
      connectionStore.add({
        id: connId,
        jobId,
        res,
        connectedAt: Date.now(),
      });

      const heartbeatTimer = setInterval(() => {
        if (!res.writableEnded) {
          writeSSEHeartbeat(res);
        }
      }, 15_000);
      req.on("close", () => {
        clearInterval(heartbeatTimer);
        connectionStore.remove(connId);
        console.log(
          `[sse] connection closed | connId=${connId} jobId=${jobId} ` +
            `duration=${Date.now() - (connectionStore.find(connId)?.connectedAt ?? Date.now())}ms`,
        );
      });
    } catch (err) {
      next(err);
    }
  };
}

export const sseController = new SSEController();
