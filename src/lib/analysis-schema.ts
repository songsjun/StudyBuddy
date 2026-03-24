export const NORMALIZED_ANALYSIS_REQUIRED_KEYS = [
  'score_estimate',
  'dimensions',
  'top_weaknesses',
  'next_actions',
  'confidence',
  'status',
] as const;

export type NormalizedAnalysisStatus = 'completed';

export type NormalizedAnalysisDimension = {
  name: string;
  score: number;
  justification: string;
};

export type NormalizedAnalysisResult = {
  score_estimate: number;
  dimensions: NormalizedAnalysisDimension[];
  top_weaknesses: string[];
  next_actions: string[];
  confidence: number;
  status: NormalizedAnalysisStatus;
};

/**
 * NormalizedFeedback is the analysis result as surfaced to callers.
 * Unlike NormalizedAnalysisResult whose status is always 'completed',
 * NormalizedFeedback carries the lifecycle status (completed | low_confidence).
 */
export type NormalizedFeedbackStatus = 'completed' | 'low_confidence';

export type NormalizedFeedback = Omit<NormalizedAnalysisResult, 'status'> & {
  status: NormalizedFeedbackStatus;
};

type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertPlainObject(value: unknown, label: string): asserts value is PlainObject {
  if (!isPlainObject(value)) {
    throw new TypeError(`${label} must be a plain object.`);
  }
}

function assertFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number.`);
  }

  return value;
}

function assertString(value: unknown, label: string): string {
  if (typeof value !== 'string') {
    throw new TypeError(`${label} must be a string.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new TypeError(`${label} must not be empty.`);
  }

  return normalized;
}

function assertStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new TypeError(`${label} must be an array of strings.`);
  }

  return value;
}

function assertDimensionArray(value: unknown, label: string): NormalizedAnalysisDimension[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be an array.`);
  }

  return value.map((item, index) => {
    assertPlainObject(item, `${label}[${index}]`);

    return {
      name: assertString(item.name, `${label}[${index}].name`),
      score: assertFiniteNumber(item.score, `${label}[${index}].score`),
      justification: assertString(item.justification, `${label}[${index}].justification`),
    };
  });
}

export function validateNormalizedAnalysisResult(input: unknown): NormalizedAnalysisResult {
  assertPlainObject(input, 'input');

  const score_estimate = assertFiniteNumber(input.score_estimate, 'score_estimate');
  const dimensions = assertDimensionArray(input.dimensions, 'dimensions');
  const top_weaknesses = assertStringArray(input.top_weaknesses, 'top_weaknesses');
  const next_actions = assertStringArray(input.next_actions, 'next_actions');
  const confidence = assertFiniteNumber(input.confidence, 'confidence');

  if (input.status !== 'completed') {
    throw new TypeError(`status must be "completed", got: ${String(input.status)}`);
  }

  return {
    score_estimate,
    dimensions,
    top_weaknesses,
    next_actions,
    confidence,
    status: 'completed',
  };
}
