export interface DashboardAnalysisRecord {
  status: string;
  top_weaknesses?: string[] | null;
}

export interface DashboardSummary {
  repeatedWeaknesses: string[];
}

export function buildDashboardSummary(records: DashboardAnalysisRecord[]): DashboardSummary {
  const counts = new Map<string, number>();

  for (const record of records) {
    if (record.status !== 'completed') {
      continue;
    }

    for (const weakness of record.top_weaknesses ?? []) {
      counts.set(weakness, (counts.get(weakness) ?? 0) + 1);
    }
  }

  return {
    repeatedWeaknesses: [...counts.entries()]
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([label]) => label),
  };
}
