import {
  validateNormalizedAnalysisResult,
  type NormalizedAnalysisResult,
} from '../../src/lib/analysis-schema';

function buildValidResult(
  overrides: Partial<NormalizedAnalysisResult> = {},
): NormalizedAnalysisResult {
  return {
    score_estimate: 78,
    dimensions: [
      {
        name: 'Evidence',
        score: 3,
        justification: 'Evidence is relevant but underexplained.',
      },
    ],
    top_weaknesses: ['Thin explanation of quoted evidence'],
    next_actions: ['Add one sentence explaining why each quote matters'],
    confidence: 0.82,
    status: 'completed',
    ...overrides,
  };
}

describe('validateNormalizedAnalysisResult', () => {
  it('returns the parsed normalized result for a valid payload', () => {
    const input = buildValidResult();

    expect(validateNormalizedAnalysisResult(input)).toEqual(input);
  });

  it('throws when a required key is missing', () => {
    const input = {
      dimensions: [],
      top_weaknesses: [],
      next_actions: [],
      confidence: 0.7,
      status: 'completed',
    };

    expect(() => validateNormalizedAnalysisResult(input)).toThrow(
      'Missing required key: score_estimate.',
    );
  });

  it('throws when confidence is not numeric', () => {
    const input = {
      ...buildValidResult(),
      confidence: '0.82',
    };

    expect(() => validateNormalizedAnalysisResult(input)).toThrow(
      'confidence must be a finite number.',
    );
  });

  it('throws when a dimension entry is malformed', () => {
    const input = {
      ...buildValidResult(),
      dimensions: [
        {
          name: 'Evidence',
          score: '3',
          justification: 'Needs clearer reasoning.',
        },
      ],
    };

    expect(() => validateNormalizedAnalysisResult(input)).toThrow(
      'dimensions[0].score must be a finite number.',
    );
  });

  it('throws when top weaknesses contain non-strings', () => {
    const input = {
      ...buildValidResult(),
      top_weaknesses: ['Missing inference', 42],
    };

    expect(() => validateNormalizedAnalysisResult(input)).toThrow(
      'top_weaknesses[1] must be a string.',
    );
  });

  it('throws when status is not completed', () => {
    const input = {
      ...buildValidResult(),
      status: 'analysis_failed',
    };

    expect(() => validateNormalizedAnalysisResult(input)).toThrow(
      'status must be "completed".',
    );
  });
});
