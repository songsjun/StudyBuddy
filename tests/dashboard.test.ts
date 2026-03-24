import { buildDashboardSummary } from '../src/lib/dashboard';

describe('buildDashboardSummary', () => {
  it('builds a trusted-history summary from completed records only', () => {
    const summary = buildDashboardSummary([
      {
        id: 'draft-1',
        status: 'queued',
        score_estimate: 40,
        confidence: 0.2,
        top_weaknesses: ['Off topic'],
        createdAt: '2026-03-24T09:00:00.000Z',
        targetName: 'ELA',
      },
      {
        id: 'a1',
        status: 'completed',
        score_estimate: 65,
        confidence: 0.7,
        top_weaknesses: ['Evidence', 'Clarity'],
        createdAt: '2026-03-24T10:00:00.000Z',
        targetName: 'ELA',
        normalized_feedback: {
          status: 'ready',
          confidence: 0.7,
          weaknesses: ['Evidence', 'Clarity'],
          recommended_actions: ['Explain the quote'],
        },
      },
      {
        id: 'a2',
        status: 'completed',
        score_estimate: 72,
        top_weaknesses: ['Evidence', 'Structure'],
        createdAt: '2026-03-24T11:00:00.000Z',
        targetName: 'ELA',
        normalized_feedback: null,
      },
      {
        id: 'a3',
        status: 'completed',
        score_estimate: 78,
        confidence: 0.9,
        createdAt: '2026-03-24T12:00:00.000Z',
        targetName: 'ELA',
        normalized_feedback: {
          status: 'low_confidence',
          confidence: 0.9,
          weaknesses: ['Structure'],
          recommended_actions: ['Tighten paragraphing'],
        },
      },
    ]);

    expect(summary.goalOverview).toEqual({
      targetName: 'ELA',
      totalCompleted: 3,
      latestScoreEstimate: 78,
      averageConfidence: 0.8,
    });
    expect(summary.timeline.map((entry) => entry.id)).toEqual(['a1', 'a2', 'a3']);
    expect(summary.repeatedWeaknesses).toEqual(['Evidence', 'Structure']);
    expect(summary.priorityAreas).toEqual(['Evidence', 'Clarity', 'Structure']);
    expect(summary.incompleteTrustedRatio).toBeCloseTo(1 / 3);
  });

  it('returns an empty summary when no analysis delegate data exists', () => {
    expect(buildDashboardSummary([])).toEqual({
      goalOverview: {
        targetName: null,
        totalCompleted: 0,
        latestScoreEstimate: null,
        averageConfidence: null,
      },
      timeline: [],
      repeatedWeaknesses: [],
      priorityAreas: [],
      incompleteTrustedRatio: 0,
    });
  });
});
