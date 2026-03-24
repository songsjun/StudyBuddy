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

  it('trusts only completed history', () => {
    expect(isTrustedHistoryStatus('completed')).toBe(true);
  });

  it('rejects every non-completed lifecycle state', () => {
    expect(isTrustedHistoryStatus('uploaded')).toBe(false);
    expect(isTrustedHistoryStatus('parsed')).toBe(false);
    expect(isTrustedHistoryStatus('analyzed')).toBe(false);
    expect(isTrustedHistoryStatus('parse_failed')).toBe(false);
    expect(isTrustedHistoryStatus('analysis_failed')).toBe(false);
    expect(isTrustedHistoryStatus('low_confidence')).toBe(false);
    expect(isTrustedHistoryStatus('human_review_needed')).toBe(false);
    expect(isTrustedHistoryStatus('pending')).toBe(false);
  });
});
