import { randomUUID } from 'crypto';
import { Job, IJobRepository, IJobService } from '../types';
import { writeSEEEvent } from '../sse/see.writer';
import { AppError } from '../utils/AppError';
import { jobRepository } from '../respositories/job.respository';
import { runJob } from '../domain/job.processor';
import { connectionStore } from '../sse/connection.store';

class JobService implements IJobService {
  constructor(private readonly repo: IJobRepository) {}

  async createAndRun(id: string): Promise<Job> {
    const job = await this.repo.create(id);
    runJob(
      id,
      async (progressData) => {
        const current = await this.repo.findById(id);
        if (current?.status === 'pending') {
          await this.repo.updateStatus(id, 'running');
        }
        const conns = connectionStore.forJob(id);
        for (const conn of conns) {
          if (!conn.res.writableEnded) {
            writeSEEEvent(conn.res, { type: 'progress', data: progressData });
          }
        }
      },
      async (completeData) => {
        await this.repo.updateStatus(id, 'complete');

        const conns = connectionStore.forJob(id);
        for (const conn of conns) {
          if (!conn.res.writableEnded) {
            writeSEEEvent(conn.res, { type: 'complete', data: completeData });
            conn.res.end();
          }
        }
        conns.forEach(c => connectionStore.remove(c.id));
      },
      async (error) => {
        await this.repo.updateStatus(id, 'error');

        const conns = connectionStore.forJob(id);
        for (const conn of conns) {
          if (!conn.res.writableEnded) {
            writeSEEEvent(conn.res, {
              type: 'error',
              data: { jobId: id, message: error.message, code: 'JOB_FAILED' },
            });
            conn.res.end();
          }
        }
        conns.forEach(c => connectionStore.remove(c.id));
      },
    );

    return job;
  }

  async getJob(id: string): Promise<Job> {
    const job = await this.repo.findById(id);
    if (!job) throw AppError.notFound(`Job ${id}`);
    return job;
  }

  async getAllJobs(): Promise<Job[]> {
    return this.repo.findAll();
  }

  async deleteJob(id: string): Promise<void> {
    const job = await this.repo.findById(id);
    if (!job) throw AppError.notFound(`Job ${id}`);
    await this.repo.delete(id);
  }
}

export const jobService = new JobService(jobRepository);
export type { JobService };