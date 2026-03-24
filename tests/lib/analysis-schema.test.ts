import { validateNormalizedAnalysisResult } from '../../src/lib/analysis-schema';

describe('validateNormalizedAnalysisResult', () => {
  it('accepts a valid top-level normalized result', () => {
    const result = validateNormalizedAnalysisResult({
      score_estimate: 78,
      dimensions: [{ name: 'evidence', score: 2 }],
      top_weaknesses: ['evidence_selection'],
      next_actions: ['Quote the strongest line before choosing an answer'],
      confidence: 0.82,
      status: 'completed',
    });

    expect(result.status).toBe('completed');
    expect(result.dimensions[0]).toEqual({ name: 'evidence', score: 2 });
  });

  it('accepts a nested normalized_feedback block', () => {
    const result = validateNormalizedAnalysisResult({
      normalized_feedback: {
        score_estimate: 78,
        dimensions: [{ label: 'evidence', score: 2 }],
        top_weaknesses: ['evidence_selection'],
        next_actions: ['Quote the strongest line before choosing an answer'],
        confidence: 0.82,
        status: 'complete',
      },
    });

    expect(result.status).toBe('completed');
    expect(result.dimensions[0]).toEqual({ name: 'evidence', score: 2 });
  });

  it('throws for malformed payloads', () => {
    expect(() =>
      validateNormalizedAnalysisResult({
        score_estimate: 78,
        dimensions: [{ name: 'evidence', score: '2' }],
        top_weaknesses: ['evidence_selection'],
        next_actions: ['Quote the strongest line before choosing an answer'],
        confidence: 0.82,
        status: 'completed',
      }),
    ).toThrow('dimensions must contain objects with name and score.');
  });
});
