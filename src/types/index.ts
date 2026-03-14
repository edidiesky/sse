/**
 * FILE: src/types/index.ts
 *
 * WHY have a dedicated types file at all:
 * When you inline types in the file that uses them, you create coupling.
 * JobProcessor needs to know the shape of ProgressPayload.
 * SSEWriter needs to know the shape of SSEEvent.
 * If both files define their own types, they diverge.
 * One source of truth here means a change in one place propagates everywhere.
 */

//  Job state machine 
//
// A job moves through these states in order:
//   pending -> running -> complete
//                      -> error
//
// It never goes backwards. 'pending' means created but first step not started.
// 'running' means at least one progress event has fired.
// Using a union type (not an enum) keeps it serializable to JSON without
// extra configuration and readable when logged.

export type JobStatus = 'pending' | 'running' | 'complete' | 'error';

//  The job record stored in our Map 
//
// This is what lives in memory. Notice it does NOT contain a reference to
// the Response object. Job state and connection state are separate concerns.
// Mixing them means one job can only have one connection - which breaks
// the moment you want two browser tabs watching the same job.

export interface Job {
  id: string;
  status: JobStatus;
  createdAt: number;  // Date.now() - number not Date because it serializes cleanly
}

//  SSE event types 
//
// Three and only three event types. Every event the server sends
// will be one of these. This is a discriminated union: the `type` field
// tells you which `data` shape to expect.
//
// WHY discriminated union instead of separate interfaces:
// You can write a single function that handles all event types:
//   function handle(event: SSEEvent) {
//     if (event.type === 'progress') { event.data.percent }  // TS knows the shape
//     if (event.type === 'complete') { event.data.result }
//   }

export type SSEEventType = 'progress' | 'complete' | 'error';

export interface ProgressData {
  jobId: string;
  percent: number;    // 0-100, integer
  message: string;    // human readable step description
  step: number;       // 1-based current step index
  totalSteps: number;
  elapsedMs: number;  // wall clock time since job started
}

export interface CompleteData {
  jobId: string;
  result: unknown;  // unknown, not any. Forces callers to narrow the type before using it.
  totalMs: number;
}

export interface ErrorData {
  jobId: string;
  message: string;
  code: string;
}

// The discriminated union itself
export type SSEEvent =
  | { type: 'progress'; data: ProgressData }
  | { type: 'complete'; data: CompleteData }
  | { type: 'error';    data: ErrorData    };

//  Connection record stored in our Map 
//
// This is the other side of the separation. A connection knows about res.
// A job does not. The controller holds both and wires them together.
//
// connectedAt is tracked so you can log "client was connected for Xms"
// on disconnect, which is useful for debugging dropped connections.

export interface Connection {
  id: string;           // unique per connection, not per job
  jobId: string;
  res: import('express').Response;
  connectedAt: number;
}

//  Repository interface 
//
// Interface lives in types/ so the service depends on the abstraction,
// not the concrete class. Swap JobRepository for a DB-backed one
// without touching the service layer.

export interface IJobRepository {
  create(id: string): Promise<Job>;
  findById(id: string): Promise<Job | null>;
  updateStatus(id: string, status: JobStatus): Promise<Job | null>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Job[]>;
}

//  Service interface 

export interface IJobService {
  createAndRun(id: string): Promise<Job>;
  getJob(id: string): Promise<Job>;
  getAllJobs(): Promise<Job[]>;
  deleteJob(id: string): Promise<void>;
}