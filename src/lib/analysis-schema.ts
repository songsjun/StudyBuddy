import {
  ANALYSIS_RESULT_STATUS,
  type AnalysisResultStatus,
} from './analysis-status';

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
  status: Extract<AnalysisResultStatus, 'completed' | 'low_confidence'>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isDimension(value: unknown): value is NormalizedAnalysisDimension {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    isFiniteNumber(value.score)
  );
}

function parseCandidate(input: Record<string, unknown>): Record<string, unknown> {
  if (isRecord(input.normalized_feedback)) {
    return input.normalized_feedback;
  }

  return input;
}

export function validateNormalizedAnalysisResult(input: unknown): NormalizedAnalysisResult {
  if (!isRecord(input)) {
    throw new Error('Normalized analysis must be an object.');
  }

  const candidate = parseCandidate(input);
  const {
    score_estimate,
    dimensions,
    top_weaknesses,
    next_actions,
    confidence,
    status,
  } = candidate;

  if (!isFiniteNumber(score_estimate)) {
    throw new Error('score_estimate must be numeric.');
  }

  if (!Array.isArray(dimensions) || !dimensions.every(isDimension)) {
    throw new Error('dimensions must be an array of { name, score }.');
  }

  if (!isStringArray(top_weaknesses)) {
    throw new Error('top_weaknesses must be a string array.');
  }

  if (!isStringArray(next_actions)) {
    throw new Error('next_actions must be a string array.');
  }

  if (!isFiniteNumber(confidence)) {
    throw new Error('confidence must be numeric.');
  }

  if (
    status !== ANALYSIS_RESULT_STATUS.COMPLETED &&
    status !== ANALYSIS_RESULT_STATUS.LOW_CONFIDENCE
  ) {
    throw new Error('status must be completed or low_confidence.');
  }

  return {
    score_estimate,
    dimensions,
    top_weaknesses,
    next_actions,
    confidence,
    status,
  };
}
