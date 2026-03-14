import { randomUUID } from 'crypto';
import { IJobRepository } from '../types';
import { Job, JobStatus } from '../types';

class JobRepository implements IJobRepository {
  private store = new Map<string, Job>();

  async create(id: string): Promise<Job> {
    const job: Job = {
      id,
      status: 'pending',
      createdAt: Date.now(),
    };
    this.store.set(job.id, job);
    return job;
  }

  async findById(id: string): Promise<Job | null> {
    return this.store.get(id) ?? null;
  }

  async updateStatus(id: string, status: JobStatus): Promise<Job | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated: Job = { ...existing, status };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async findAll(): Promise<Job[]> {
    return Array.from(this.store.values());
  }

  // Test helper only
  clear(): void {
    this.store.clear();
  }
}

export const jobRepository = new JobRepository();
export type { JobRepository };