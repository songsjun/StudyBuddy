export const ANALYSIS_RESULT_STATUS = {
  COMPLETED: 'completed',
  LOW_CONFIDENCE: 'low_confidence',
  ANALYSIS_FAILED: 'analysis_failed',
  HUMAN_REVIEW_NEEDED: 'human_review_needed'
} as const;

export type AnalysisResultStatus =
  (typeof ANALYSIS_RESULT_STATUS)[keyof typeof ANALYSIS_RESULT_STATUS];

export function isTerminalAnalysisStatus(value: unknown): value is AnalysisResultStatus {
  return Object.values(ANALYSIS_RESULT_STATUS).includes(value as AnalysisResultStatus);
}
