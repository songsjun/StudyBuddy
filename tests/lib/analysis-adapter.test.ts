import { runAnalysis, type AnalysisProviderInvocation, type ProviderExecutionResult } from '../../src/lib/ai/adapter';

function createRunner(responses: ProviderExecutionResult[]) {
  let index = 0;

  return async (_invocation: AnalysisProviderInvocation): Promise<ProviderExecutionResult> => {
    const response = responses[index];
    index += 1;

    if (!response) {
      throw new Error('No stubbed response left.');
    }

    return response;
  };
}

describe('runAnalysis', () => {
  it('returns completed for valid high-confidence analysis', async () => {
    const response = await runAnalysis({
      provider: 'codex',
      goal: { targetName: 'LA-30 reading + essay' },
      parsedArtifact: { markdown: 'Student answer' },
      reviewMode: false,
      runner: createRunner([
        {
          stdout: JSON.stringify({
            score_estimate: 78,
            dimensions: [{ name: 'evidence', score: 2 }],
            top_weaknesses: ['evidence_selection'],
            next_actions: ['Quote the strongest line before choosing an answer'],
            confidence: 0.82,
            status: 'completed',
          }),
          stderr: '',
          exitCode: 0,
        },
      ]),
    });

    expect(response.status).toBe('completed');
    expect(response.result?.status).toBe('completed');
    expect(response.providerMetadata.provider).toBe('codex');
  });

  it('returns analysis_failed for invalid JSON', async () => {
    const response = await runAnalysis({
      provider: 'codex',
      goal: { targetName: 'LA-30 reading + essay' },
      parsedArtifact: { markdown: 'Student answer' },
      reviewMode: false,
      runner: createRunner([
        {
          stdout: 'not-json',
          stderr: '',
          exitCode: 0,
        },
      ]),
    });

    expect(response.status).toBe('analysis_failed');
    expect(response.result).toBeNull();
  });

  it('returns low_confidence when confidence is below the threshold', async () => {
    const response = await runAnalysis({
      provider: 'codex',
      goal: { targetName: 'LA-30 reading + essay' },
      parsedArtifact: { markdown: 'Student answer' },
      reviewMode: false,
      confidenceThreshold: 0.7,
      runner: createRunner([
        {
          stdout: JSON.stringify({
            score_estimate: 55,
            dimensions: [{ name: 'evidence', score: 1 }],
            top_weaknesses: ['evidence_selection'],
            next_actions: ['Use one direct quote'],
            confidence: 0.42,
            status: 'completed',
          }),
          stderr: '',
          exitCode: 0,
        },
      ]),
    });

    expect(response.status).toBe('low_confidence');
    expect(response.result?.confidence).toBe(0.42);
  });

  it('returns human_review_needed when secondary provider materially disagrees', async () => {
    const response = await runAnalysis({
      provider: 'codex',
      secondaryProvider: 'gemini',
      goal: { targetName: 'LA-30 reading + essay' },
      parsedArtifact: { markdown: 'Student answer' },
      reviewMode: true,
      runner: createRunner([
        {
          stdout: JSON.stringify({
            score_estimate: 86,
            dimensions: [{ name: 'evidence', score: 3 }],
            top_weaknesses: ['precision'],
            next_actions: ['Tighten your thesis'],
            confidence: 0.84,
            status: 'completed',
          }),
          stderr: '',
          exitCode: 0,
        },
        {
          stdout: JSON.stringify({
            score_estimate: 58,
            dimensions: [{ name: 'evidence', score: 1 }],
            top_weaknesses: ['evidence_selection'],
            next_actions: ['Use one direct quote'],
            confidence: 0.8,
            status: 'completed',
          }),
          stderr: '',
          exitCode: 0,
        },
      ]),
    });

    expect(response.status).toBe('human_review_needed');
    expect(response.reviewMetadata?.reason).toBe('material_disagreement');
    expect(response.reviewMetadata?.secondaryProviderMetadata.provider).toBe('gemini');
  });

  it('matches the issue acceptance contract for the non-review path', async () => {
    const response = await runAnalysis({
      provider: 'codex',
      goal: { targetName: 'LA-30 reading + essay' },
      parsedArtifact: { markdown: 'Student answer' },
      reviewMode: false,
      runner: createRunner([
        {
          stdout: JSON.stringify({
            score_estimate: 78,
            dimensions: [{ name: 'evidence', score: 2 }],
            top_weaknesses: ['evidence_selection'],
            next_actions: ['Quote the strongest line before choosing an answer'],
            confidence: 0.82,
            status: 'completed',
          }),
          stderr: '',
          exitCode: 0,
        },
      ]),
    });

    expect(['completed', 'low_confidence', 'analysis_failed']).toContain(response.status);
  });
});
