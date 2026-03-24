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
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be an array.`);
  }

  return value.map((item, index) => assertString(item, `${label}[${index}]`));
}

function validateDimension(value: unknown, index: number): NormalizedAnalysisDimension {
  assertPlainObject(value, `dimensions[${index}]`);

  return {
    name: assertString(value.name, `dimensions[${index}].name`),
    score: assertFiniteNumber(value.score, `dimensions[${index}].score`),
    justification: assertString(
      value.justification,
      `dimensions[${index}].justification`,
    ),
  };
}

function validateDimensions(value: unknown): NormalizedAnalysisDimension[] {
  if (!Array.isArray(value)) {
    throw new TypeError('dimensions must be an array.');
  }

  return value.map((item, index) => validateDimension(item, index));
}

function assertRequiredKeys(value: PlainObject): void {
  for (const key of NORMALIZED_ANALYSIS_REQUIRED_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      throw new TypeError(`Missing required key: ${key}.`);
    }
  }
}

function validateStatus(value: unknown): NormalizedAnalysisStatus {
  const status = assertString(value, 'status');

  if (status !== 'completed') {
    throw new TypeError('status must be \"completed\".');
  }

  return status;
}

export function validateNormalizedAnalysisResult(
  input: unknown,
): NormalizedAnalysisResult {
  assertPlainObject(input, 'analysis result');
  assertRequiredKeys(input);

  return {
    score_estimate: assertFiniteNumber(input.score_estimate, 'score_estimate'),
    dimensions: validateDimensions(input.dimensions),
    top_weaknesses: assertStringArray(input.top_weaknesses, 'top_weaknesses'),
    next_actions: assertStringArray(input.next_actions, 'next_actions'),
    confidence: assertFiniteNumber(input.confidence, 'confidence'),
    status: validateStatus(input.status),
  };
}
