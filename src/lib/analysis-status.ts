export const ANALYSIS_RESULT_STATUS = {
  COMPLETED: 'completed',
  LOW_CONFIDENCE: 'low_confidence',
  ANALYSIS_FAILED: 'analysis_failed',
  HUMAN_REVIEW_NEEDED: 'human_review_needed',
} as const;

export type AnalysisResultStatus =
  (typeof ANALYSIS_RESULT_STATUS)[keyof typeof ANALYSIS_RESULT_STATUS];

export function isTerminalAnalysisStatus(value: unknown): value is AnalysisResultStatus {
  return Object.values(ANALYSIS_RESULT_STATUS).includes(value as AnalysisResultStatus);
}

// Aliases used by adapter.ts
export const ANALYSIS_LIFECYCLE_STATUS = ANALYSIS_RESULT_STATUS;
export type AnalysisLifecycleStatus = AnalysisResultStatus;
export const DEFAULT_CONFIDENCE_THRESHOLD = 0.7;

export function getAnalysisStatusForResult(
  result: { confidence?: number },
  threshold: number,
): AnalysisLifecycleStatus {
  if (typeof result.confidence === 'number' && result.confidence < threshold) {
    return ANALYSIS_LIFECYCLE_STATUS.LOW_CONFIDENCE;
  }
  return ANALYSIS_LIFECYCLE_STATUS.COMPLETED;
}
