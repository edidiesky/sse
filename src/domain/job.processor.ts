import { ProgressData, CompleteData } from "../types";

//  Step definition
interface Step {
  name: string;
  durationMs: number;
}

export const JOB_STEPS: Step[] = [
  { name: "Validating input schema", durationMs: 500 },
  { name: "Fetching source records", durationMs: 800 },
  { name: "Applying transformation rules", durationMs: 1000 },
  { name: "Running aggregation pass", durationMs: 700 },
  { name: "Writing to output store", durationMs: 600 },
  { name: "Generating audit trail", durationMs: 400 },
];

export type OnProgress = (data: ProgressData) => void;
export type OnComplete = (data: CompleteData) => void;
export type OnError = (error: Error) => void;

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

//  runJob
export async function runJob(
  jobId: string,
  onProgress: OnProgress,
  onComplete: OnComplete,
  onError: OnError,
): Promise<void> {
  const startTime = Date.now();

  try {
    for (let i = 0; i < JOB_STEPS.length; i++) {
      const step = JOB_STEPS[i]!;

      await sleep(step.durationMs);

      const stepNumber = i + 1;
      const percent = Math.round((stepNumber / JOB_STEPS.length) * 100);
      onProgress({
        jobId,
        percent,
        message: step.name,
        step: stepNumber,
        totalSteps: JOB_STEPS.length,
        elapsedMs: Date.now() - startTime,
      });
    }
    onComplete({
      jobId,
      result: {
        recordsProcessed: 4821,
        outputPath: `outputs/${jobId}/result.json`,
        checksum: "sha256:f4ca408e",
      },
      totalMs: Date.now() - startTime,
    });
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
