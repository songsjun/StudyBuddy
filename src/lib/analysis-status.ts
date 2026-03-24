import type { NormalizedAnalysisResult } from './analysis-schema';

export const ANALYSIS_LIFECYCLE_STATUS = {
  COMPLETED: 'completed',
  ANALYSIS_FAILED: 'analysis_failed',
  LOW_CONFIDENCE: 'low_confidence',
  HUMAN_REVIEW_NEEDED: 'human_review_needed',
} as const;

export type AnalysisLifecycleStatus =
  (typeof ANALYSIS_LIFECYCLE_STATUS)[keyof typeof ANALYSIS_LIFECYCLE_STATUS];

export const DEFAULT_CONFIDENCE_THRESHOLD = 0.7;

export function getAnalysisStatusForResult(
  result: NormalizedAnalysisResult,
  confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD,
): AnalysisLifecycleStatus {
  if (result.confidence < confidenceThreshold) {
    return ANALYSIS_LIFECYCLE_STATUS.LOW_CONFIDENCE;
  }

  return ANALYSIS_LIFECYCLE_STATUS.COMPLETED;
}
