import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { jobService, JobService } from '../services/job.service';

/**
 * FILE: src/controllers/job.controller.ts
 *
 * Compare this to the old version:
 *
 * OLD createJob (30+ lines):
 *   - Generated ID, called jobStore directly, called runJob directly
 *   - Defined all three processor callbacks inline with SSE writes
 *   - Controller owned orchestration, business logic, AND HTTP
 *
 * NEW createJob (5 lines):
 *   - Generates ID, delegates to service, returns 202
 *   - Controller owns HTTP only
 *
 * jobService.createAndRun() can now be called from a queue worker,
 * a cron job, or a test without touching Express at all.
 */
class JobController {
  constructor(private readonly service: JobService) {}

  createJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = randomUUID();
      const job = await this.service.createAndRun(id);
      // 202 Accepted: work in progress, not yet complete
      res.status(202).json({ jobId: job.id });
    } catch (err) {
      next(err);
    }
  };

  getJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await this.service.getJob(req.params['id'] as string);
      res.json({ data: job });
    } catch (err) {
      next(err);
    }
  };

  getAllJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobs = await this.service.getAllJobs();
      res.json({ data: jobs });
    } catch (err) {
      next(err);
    }
  };

  deleteJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteJob(req.params['id'] as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

export const jobController = new JobController(jobService);