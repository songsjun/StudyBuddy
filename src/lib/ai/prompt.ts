export interface AnalysisPromptInput {
  goal: Record<string, unknown>;
  parsedArtifact: Record<string, unknown>;
  rubric?: Record<string, unknown> | string;
  dimensions?: Array<Record<string, unknown>>;
}

export interface StructuredAnalysisPrompt {
  system: string;
  user: string;
}

const SYSTEM_PROMPT = [
  'You are a strict study artifact analysis engine.',
  'Use only the provided goal context, rubric, dimensions, and parsed artifact.',
  'Do not invent evidence or infer missing content.',
  'Return JSON only.',
  'The JSON must contain exactly these keys:',
  '{',
  '  "score_estimate": 0,',
  '  "dimensions": [{"name": "evidence", "score": 0}],',
  '  "top_weaknesses": ["string"],',
  '  "next_actions": ["string"],',
  '  "confidence": 0,',
  '  "status": "completed"',
  '}',
  'confidence must be a number from 0 to 1.',
  'If the artifact does not support a reliable judgment, lower confidence instead of guessing.',
].join('\n');

function renderJsonBlock(label: string, value: unknown): string {
  return [label, JSON.stringify(value, null, 2)].join('\n');
}

export function buildAnalysisPrompt(input: AnalysisPromptInput): StructuredAnalysisPrompt {
  const user = [
    'Analyze the student artifact and return only the normalized JSON payload.',
    '',
    renderJsonBlock('Goal:', input.goal),
    '',
    renderJsonBlock('Rubric:', input.rubric ?? {}),
    '',
    renderJsonBlock('Dimensions:', input.dimensions ?? []),
    '',
    renderJsonBlock('Parsed artifact:', input.parsedArtifact),
  ].join('\n');

  return {
    system: SYSTEM_PROMPT,
    user,
  };
}
