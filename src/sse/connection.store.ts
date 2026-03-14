/**
 * FILE: src/jobs/connectionStore.ts
 *
 * WHY a separate store for connections:
 *
 * The job store holds what the job knows: id, status, timestamps.
 * The connection store holds what the HTTP layer knows: the Response object.
 *
 * If you put the Response inside the Job record, you couple your domain
 * object to Express internals. A Job should be serializable to JSON.
 * An express Response object is not.
 *
 * Separation also enables:
 * - One job, multiple connections (two browser tabs watching the same job)
 * - A job running with zero connections (client disconnected mid-job)
 * - Looking up all connections for a job efficiently
 *
 * In Stage 1 we never have more than one connection per job, but writing
 * the store this way costs nothing and prevents a painful refactor later.
 */

import { Connection } from '../types';

export class ConnectionStore {
  // connId -> Connection
  // We key by connection ID, not job ID, because multiple connections
  // can exist for one job. A Map keyed by jobId would overwrite on
  // the second connection.
  private connections = new Map<string, Connection>();

  //  Write operations 

  add(conn: Connection): void {
    this.connections.set(conn.id, conn);
  }

  remove(connId: string): void {
    this.connections.delete(connId);
  }

  clear(): void {
    this.connections.clear();
  }

  //  Read operations 

  find(connId: string): Connection | undefined {
    return this.connections.get(connId);
  }

  // Get all connections watching a specific job.
  // This is O(n) over total connections - acceptable for Stage 1 volumes.
  // At high scale (10k+ connections) you would add a secondary index:
  //   jobConnections = new Map<string, Set<string>>()  // jobId -> Set<connId>
  forJob(jobId: string): Connection[] {
    return Array.from(this.connections.values())
      .filter(c => c.jobId === jobId);
  }

  get size(): number {
    return this.connections.size;
  }

  all(): Connection[] {
    return Array.from(this.connections.values());
  }
}

export const connectionStore = new ConnectionStore();