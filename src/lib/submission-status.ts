export const SUBMISSION_LIFECYCLE_STATUSES = [
  'uploaded',
  'parsed',
  'analyzed',
  'completed',
  'parse_failed',
  'analysis_failed',
  'low_confidence',
  'human_review_needed'
] as const;

export type SubmissionLifecycleStatus =
  (typeof SUBMISSION_LIFECYCLE_STATUSES)[number];

const TRUSTED_HISTORY_STATUSES: ReadonlySet<SubmissionLifecycleStatus> = new Set([
  'completed'
]);

export function isTrustedHistoryStatus(
  status: string
): status is SubmissionLifecycleStatus {
  return TRUSTED_HISTORY_STATUSES.has(status as SubmissionLifecycleStatus);
}
