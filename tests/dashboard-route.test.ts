jest.mock('../src/lib/prisma', () => ({
  prisma: {
    analysis: {
      findMany: jest.fn(),
    },
  },
}));

import { GET } from '../src/app/api/dashboard/route';
import { prisma } from '../src/lib/prisma';

describe('GET /api/dashboard', () => {
  it('returns the computed dashboard summary from stored records', async () => {
    const findMany = (prisma as unknown as { analysis: { findMany: jest.Mock } }).analysis.findMany;

    findMany.mockResolvedValue([
      {
        id: 'one',
        status: 'completed',
        score_estimate: 66,
        confidence: 0.6,
        top_weaknesses: ['Evidence'],
        createdAt: '2026-03-24T10:00:00.000Z',
        targetName: 'Math',
        normalized_feedback: {
          status: 'ready',
          confidence: 0.6,
          weaknesses: ['Evidence'],
          recommended_actions: ['Cite stronger support'],
        },
      },
      {
        id: 'two',
        status: 'completed',
        score_estimate: 74,
        createdAt: '2026-03-24T11:00:00.000Z',
        targetName: 'Math',
        normalized_feedback: null,
        top_weaknesses: ['Evidence', 'Accuracy'],
      },
      {
        id: 'three',
        status: 'processing',
        score_estimate: 99,
        confidence: 0.99,
        top_weaknesses: ['Ignore me'],
        createdAt: '2026-03-24T12:00:00.000Z',
        targetName: 'Math',
      },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'asc' },
    });
    expect(body.goalOverview).toEqual({
      targetName: 'Math',
      totalCompleted: 2,
      latestScoreEstimate: 74,
      averageConfidence: 0.6,
    });
    expect(body.timeline).toHaveLength(2);
    expect(body.repeatedWeaknesses).toEqual(['Evidence']);
    expect(body.priorityAreas).toEqual(['Evidence', 'Accuracy']);
    expect(body.incompleteTrustedRatio).toBe(0.5);
  });
});
