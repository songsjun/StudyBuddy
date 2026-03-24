export type DashboardNormalizedFeedback = {
  status?: string | null;
  confidence?: number | null;
  summary?: string | null;
  weaknesses?: string[] | null;
  recommended_actions?: string[] | null;
};

export type DashboardRecord = {
  id?: string;
  status: string;
  targetName?: string | null;
  score_estimate?: number | null;
  confidence?: number | null;
  top_weaknesses?: string[] | null;
  next_actions?: string[] | null;
  createdAt?: Date | string | null;
  normalized_feedback?: DashboardNormalizedFeedback | null;
  goal?: { targetName?: string | null } | null;
  studyGoal?: { targetName?: string | null } | null;
};

export type DashboardSummary = {
  goalOverview: {
    targetName: string | null;
    totalCompleted: number;
    latestScoreEstimate: number | null;
    averageConfidence: number | null;
  };
  timeline: Array<{
    id: string | null;
    createdAt: string | null;
    scoreEstimate: number | null;
    confidence: number | null;
    status: string;
  }>;
  repeatedWeaknesses: string[];
  priorityAreas: string[];
  incompleteTrustedRatio: number;
};

function normalizeText(value: string): string {
  return value.trim();
}

function toTimestamp(value: DashboardRecord['createdAt']): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function toIsoString(value: DashboardRecord['createdAt']): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
}

function readConfidence(record: DashboardRecord): number | null {
  if (typeof record.confidence === 'number' && Number.isFinite(record.confidence)) {
    return record.confidence;
  }
  const fallback = record.normalized_feedback?.confidence;
  return typeof fallback === 'number' && Number.isFinite(fallback) ? fallback : null;
}

function readWeaknesses(record: DashboardRecord): string[] {
  if (Array.isArray(record.top_weaknesses) && record.top_weaknesses.length > 0) {
    return record.top_weaknesses;
  }
  return record.normalized_feedback?.weaknesses ?? [];
}

function readTargetName(record: DashboardRecord): string | null {
  const candidates = [record.targetName, record.goal?.targetName, record.studyGoal?.targetName];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

export function buildDashboardSummary(records: DashboardRecord[]): DashboardSummary {
  // Only strictly-completed records contribute to trusted history
  const completedRecords = records
    .filter((record) => record.status === 'completed')
    .sort((left, right) => toTimestamp(left.createdAt) - toTimestamp(right.createdAt));

  // Build weakness counts preserving first-occurrence insertion order
  const weaknessCounts = new Map<string, number>();

  for (const record of completedRecords) {
    for (const weakness of readWeaknesses(record)) {
      const normalized = normalizeText(weakness);
      if (!normalized) continue;
      weaknessCounts.set(normalized, (weaknessCounts.get(normalized) ?? 0) + 1);
    }
  }

  // priorityAreas: all unique weaknesses in first-occurrence order
  const priorityAreas = [...weaknessCounts.keys()];

  // repeatedWeaknesses: weaknesses meeting the repetition threshold
  // With N completed records, threshold = min(2, N) so that:
  //   - 1 record  → threshold 1 (every weakness qualifies as "seen")
  //   - 2+ records → threshold 2 (must appear in at least 2 sessions)
  const threshold = Math.min(2, completedRecords.length);
  const repeatedWeaknesses = [...weaknessCounts.entries()]
    .filter(([, count]) => threshold > 0 && count >= threshold)
    .sort((left, right) => {
      if (right[1] !== left[1]) return right[1] - left[1];
      return left[0].localeCompare(right[0]);
    })
    .map(([weakness]) => weakness);

  const confidenceValues = completedRecords
    .map(readConfidence)
    .filter((value): value is number => typeof value === 'number');

  const latestRecord = completedRecords[completedRecords.length - 1];
  const incompleteTrustedCount = completedRecords.filter(
    (record) => record.normalized_feedback == null,
  ).length;

  return {
    goalOverview: {
      targetName: latestRecord ? readTargetName(latestRecord) : null,
      totalCompleted: completedRecords.length,
      latestScoreEstimate:
        latestRecord && typeof latestRecord.score_estimate === 'number'
          ? latestRecord.score_estimate
          : null,
      averageConfidence: confidenceValues.length
        ? confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length
        : null,
    },
    timeline: completedRecords.map((record) => ({
      id: typeof record.id === 'string' ? record.id : null,
      createdAt: toIsoString(record.createdAt),
      scoreEstimate:
        typeof record.score_estimate === 'number' ? record.score_estimate : null,
      confidence: readConfidence(record),
      status: record.status,
    })),
    repeatedWeaknesses,
    priorityAreas,
    incompleteTrustedRatio:
      completedRecords.length > 0 ? incompleteTrustedCount / completedRecords.length : 0,
  };
}
