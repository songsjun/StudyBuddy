import {
  ANALYSIS_RESULT_STATUS,
  type AnalysisResultStatus,
} from '../analysis-status';
import {
  type NormalizedAnalysisResult,
  validateNormalizedAnalysisResult,
} from '../analysis-schema';

export interface AnalysisRequest {
  provider: AnalysisProvider;
  goal: {
    targetName: string;
  };
  parsedArtifact: {
    markdown: string;
  };
  reviewMode: boolean;
}

export interface AnalysisProviderResponse {
  stdout: string;
  stderr?: string;
  exitCode?: number;
}

export interface AnalysisProvider {
  run(request: { prompt: string }): Promise<AnalysisProviderResponse>;
}

export interface AnalysisRunResult {
  status: AnalysisResultStatus;
  normalized_feedback: NormalizedAnalysisResult | null;
  providerMetadata: {
    stdout: string;
    stderr: string;
    exitCode: number;
  };
}

const LOW_CONFIDENCE_THRESHOLD = 0.5;

function buildPrompt(request: AnalysisRequest): string {
  return [
    `Target: ${request.goal.targetName}`,
    'Return JSON only.',
    request.parsedArtifact.markdown,
  ].join('\n\n');
}

function failedResult(response: AnalysisProviderResponse): AnalysisRunResult {
  return {
    status: ANALYSIS_RESULT_STATUS.ANALYSIS_FAILED,
    normalized_feedback: null,
    providerMetadata: {
      stdout: response.stdout,
      stderr: response.stderr ?? '',
      exitCode: response.exitCode ?? 0,
    },
  };
}

export async function runAnalysis(request: AnalysisRequest): Promise<AnalysisRunResult> {
  const response = await request.provider.run({
    prompt: buildPrompt(request),
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(response.stdout);
  } catch {
    return failedResult(response);
  }

  let normalized: NormalizedAnalysisResult;
  try {
    normalized = validateNormalizedAnalysisResult(parsed);
  } catch {
    return failedResult(response);
  }

  if (normalized.confidence < LOW_CONFIDENCE_THRESHOLD) {
    return {
      status: ANALYSIS_RESULT_STATUS.LOW_CONFIDENCE,
      normalized_feedback: {
        ...normalized,
        status: ANALYSIS_RESULT_STATUS.LOW_CONFIDENCE,
      },
      providerMetadata: {
        stdout: response.stdout,
        stderr: response.stderr ?? '',
        exitCode: response.exitCode ?? 0,
      },
    };
  }

  return {
    status: normalized.status,
    normalized_feedback: normalized,
    providerMetadata: {
      stdout: response.stdout,
      stderr: response.stderr ?? '',
      exitCode: response.exitCode ?? 0,
    },
  };
}
