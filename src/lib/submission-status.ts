export const TRUSTED_HISTORY_STATUSES = [
  'completed',
  'low_confidence',
] as const;

export type TrustedHistoryStatus = (typeof TRUSTED_HISTORY_STATUSES)[number];

export type SubmissionStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'low_confidence'
  | 'failed'
  | 'human_review_needed';

export function isTrustedHistoryStatus(
  status: string,
): status is TrustedHistoryStatus {
  return TRUSTED_HISTORY_STATUSES.includes(status as TrustedHistoryStatus);
}
