import type { AnalysisProvider, AnalysisProviderResponse } from '../../src/lib/ai/adapter';

export function createFakeProvider(stdout: string): AnalysisProvider {
  return {
    async run(): Promise<AnalysisProviderResponse> {
      return {
        stdout,
        stderr: '',
        exitCode: 0,
      };
    },
  };
}

export function buildValidAnalysisPayload(): string {
  return JSON.stringify({
    score_estimate: 78,
    dimensions: [
      { name: 'evidence', score: 2 },
      { name: 'reasoning', score: 3 },
    ],
    top_weaknesses: ['evidence_selection'],
    next_actions: ['Quote the strongest line before choosing an answer'],
    confidence: 0.82,
    status: 'completed',
  });
}

export function buildMalformedAnalysisPayload(): string {
  return JSON.stringify({
    score_estimate: 78,
    dimensions: 'not-an-array',
    top_weaknesses: ['evidence_selection'],
    next_actions: ['Quote the strongest line before choosing an answer'],
    confidence: 0.82,
    status: 'completed',
  });
}

export function buildLowConfidenceAnalysisPayload(): string {
  return JSON.stringify({
    score_estimate: 78,
    dimensions: [
      { name: 'evidence', score: 2 },
      { name: 'reasoning', score: 3 },
    ],
    top_weaknesses: ['grammar'],
    next_actions: ['Slow down and reread each sentence'],
    confidence: 0.24,
    status: 'completed',
  });
}
