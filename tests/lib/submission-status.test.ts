import {
  TRUSTED_HISTORY_STATUSES,
  isTrustedHistoryStatus,
} from '../../src/lib/submission-status';

describe('isTrustedHistoryStatus', () => {
  it('returns true for trusted history statuses', () => {
    expect(TRUSTED_HISTORY_STATUSES).toEqual(['completed', 'low_confidence']);
    expect(isTrustedHistoryStatus('completed')).toBe(true);
    expect(isTrustedHistoryStatus('low_confidence')).toBe(true);
  });

  it('returns false for non-trusted lifecycle statuses', () => {
    expect(isTrustedHistoryStatus('queued')).toBe(false);
    expect(isTrustedHistoryStatus('processing')).toBe(false);
    expect(isTrustedHistoryStatus('failed')).toBe(false);
    expect(isTrustedHistoryStatus('human_review_needed')).toBe(false);
  });

  it('returns false for unknown values', () => {
    expect(isTrustedHistoryStatus('')).toBe(false);
    expect(isTrustedHistoryStatus('archived')).toBe(false);
    expect(isTrustedHistoryStatus('COMPLETE')).toBe(false);
  });
});
