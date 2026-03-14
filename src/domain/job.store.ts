import { Job, JobStatus } from '../types';

export class JobStore {
  private jobs = new Map<string, Job>();

  //  Write operations 
  create(job: Job): void {
    if (this.jobs.has(job.id)) {
      throw new Error(`Job ${job.id} already exists in store`);
    }
    this.jobs.set(job.id, job);
  }

  updateStatus(id: string, status: JobStatus): void {
    const job = this.jobs.get(id);
    if (!job) {
      throw new Error(`Cannot update status: job ${id} not found`);
    }
    this.jobs.set(id, { ...job, status });
  }

  delete(id: string): void {
    this.jobs.delete(id);
  }

  //  Read operations 

  find(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  all(): Job[] {
    return Array.from(this.jobs.values());
  }

  get size(): number {
    return this.jobs.size;
  }

  clear(): void {
    this.jobs.clear();
  }
}
export const jobStore = new JobStore();