import { validateNormalizedAnalysisResult } from '../../src/lib/analysis-schema';
import { runAnalysis } from '../../src/lib/ai/adapter';
import { buildDashboardSummary } from '../../src/lib/dashboard';
import {
  buildLowConfidenceAnalysisPayload,
  buildMalformedAnalysisPayload,
  buildValidAnalysisPayload,
  createFakeProvider,
} from '../helpers/fake-provider';

describe('analysis and dashboard', () => {
  it('accepts valid normalized analysis as completed', () => {
    const validPayload = JSON.parse(buildValidAnalysisPayload());

    expect(validateNormalizedAnalysisResult(validPayload).status).toBe('completed');
  });

  it('maps malformed provider output to analysis_failed', async () => {
    const result = await runAnalysis({
      provider: createFakeProvider(buildMalformedAnalysisPayload()),
      goal: { targetName: 'LA-30 reading + essay' },
      parsedArtifact: { markdown: 'Student answer' },
      reviewMode: false,
    });

    expect(result.status).toBe('analysis_failed');
    expect(result.normalized_feedback).toBeNull();
  });

  it('maps low-confidence provider output to low_confidence', async () => {
    const result = await runAnalysis({
      provider: createFakeProvider(buildLowConfidenceAnalysisPayload()),
      goal: { targetName: 'LA-30 reading + essay' },
      parsedArtifact: { markdown: 'Student answer' },
      reviewMode: false,
    });

    expect(result.status).toBe('low_confidence');
    expect(result.normalized_feedback?.status).toBe('low_confidence');
  });

  it('excludes incomplete history from dashboard weaknesses', () => {
    const summary = buildDashboardSummary([
      { status: 'completed', top_weaknesses: ['evidence_selection'] },
      { status: 'low_confidence', top_weaknesses: ['grammar'] },
      { status: 'analysis_failed', top_weaknesses: ['organization'] },
    ]);

    expect(summary.repeatedWeaknesses).toEqual(['evidence_selection']);
  });
});
