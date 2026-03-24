import { buildDashboardSummary, type DashboardRecord } from '../../lib/dashboard';
import { prisma } from '../../lib/prisma';

type AnalysisDelegate = {
  findMany: (args?: Record<string, unknown>) => Promise<DashboardRecord[]>;
};

function json(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json' },
  });
}

function getAnalysisDelegate(): AnalysisDelegate | null {
  const client = prisma as unknown as Record<string, unknown>;
  const candidates = ['analysisResponse', 'analysisResult', 'analysis'];

  for (const key of candidates) {
    const delegate = client[key] as AnalysisDelegate | undefined;
    if (delegate && typeof delegate.findMany === 'function') {
      return delegate;
    }
  }

  return null;
}

export async function GET(): Promise<Response> {
  const delegate = getAnalysisDelegate();

  if (!delegate) {
    return json(buildDashboardSummary([]));
  }

  const records = await delegate.findMany({
    orderBy: { createdAt: 'asc' },
  });

  return json(buildDashboardSummary(records));
}
