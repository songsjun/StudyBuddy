import {
  SUBMISSION_LIFECYCLE_STATUSES,
  isTrustedHistoryStatus
} from '../../src/lib/submission-status';

describe('isTrustedHistoryStatus', () => {
  it('exposes every explicit lifecycle state', () => {
    expect(SUBMISSION_LIFECYCLE_STATUSES).toEqual([
      'uploaded',
      'parsed',
      'analyzed',
      'completed',
      'parse_failed',
      'analysis_failed',
      'low_confidence',
      'human_review_needed'
    ]);
  });

  it('trusts every defined lifecycle state', () => {
    expect(
      SUBMISSION_LIFECYCLE_STATUSES.every((status) =>
        isTrustedHistoryStatus(status)
      )
    ).toBe(true);
  });

  it('rejects values outside the lifecycle history', () => {
    expect(isTrustedHistoryStatus('pending')).toBe(false);
    expect(isTrustedHistoryStatus('failed')).toBe(false);
    expect(isTrustedHistoryStatus('')).toBe(false);
  });
});
