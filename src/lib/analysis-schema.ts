export interface NormalizedAnalysisDimension {
  name: string;
  score: number;
}

export interface NormalizedAnalysisResult {
  score_estimate: number;
  dimensions: NormalizedAnalysisDimension[];
  top_weaknesses: string[];
  next_actions: string[];
  confidence: number;
  status: 'completed';
}

const REQUIRED_KEYS = [
  'score_estimate',
  'dimensions',
  'top_weaknesses',
  'next_actions',
  'confidence',
  'status',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function normalizeStatus(value: unknown): 'completed' | null {
  if (value === 'completed' || value === 'complete') {
    return 'completed';
  }

  return null;
}

function normalizeDimension(value: unknown): NormalizedAnalysisDimension | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawName = typeof value.name === 'string'
    ? value.name
    : typeof value.label === 'string'
      ? value.label
      : null;

  if (!rawName || !isFiniteNumber(value.score)) {
    return null;
  }

  return {
    name: rawName,
    score: value.score,
  };
}

function getCandidate(input: Record<string, unknown>): Record<string, unknown> | null {
  const hasTopLevelKeys = REQUIRED_KEYS.every((key) => key in input);
  if (hasTopLevelKeys) {
    return input;
  }

  const nested = input.normalized_feedback;
  if (isRecord(nested) && REQUIRED_KEYS.every((key) => key in nested)) {
    return nested;
  }

  return null;
}

export function validateNormalizedAnalysisResult(
  input: unknown,
): NormalizedAnalysisResult {
  if (!isRecord(input)) {
    throw new Error('Normalized analysis result must be an object.');
  }

  const candidate = getCandidate(input);
  if (!candidate) {
    throw new Error('Normalized analysis result is missing required keys.');
  }

  if (!isFiniteNumber(candidate.score_estimate)) {
    throw new Error('score_estimate must be a finite number.');
  }

  if (!Array.isArray(candidate.dimensions)) {
    throw new Error('dimensions must be an array.');
  }

  const dimensions = candidate.dimensions.map((dimension) => normalizeDimension(dimension));
  if (dimensions.some((dimension) => dimension === null)) {
    throw new Error('dimensions must contain objects with name and score.');
  }

  if (!isStringArray(candidate.top_weaknesses)) {
    throw new Error('top_weaknesses must be a string array.');
  }

  if (!isStringArray(candidate.next_actions)) {
    throw new Error('next_actions must be a string array.');
  }

  if (!isFiniteNumber(candidate.confidence)) {
    throw new Error('confidence must be a finite number.');
  }

  if (candidate.confidence < 0 || candidate.confidence > 1) {
    throw new Error('confidence must be between 0 and 1.');
  }

  const status = normalizeStatus(candidate.status);
  if (!status) {
    throw new Error('status must be completed.');
  }

  return {
    score_estimate: candidate.score_estimate,
    dimensions: dimensions as NormalizedAnalysisDimension[],
    top_weaknesses: candidate.top_weaknesses,
    next_actions: candidate.next_actions,
    confidence: candidate.confidence,
    status,
  };
}
