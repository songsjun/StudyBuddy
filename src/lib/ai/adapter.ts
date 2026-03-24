import { ANALYSIS_LIFECYCLE_STATUS, DEFAULT_CONFIDENCE_THRESHOLD, getAnalysisStatusForResult, type AnalysisLifecycleStatus } from '../analysis-status';
import { validateNormalizedAnalysisResult, type NormalizedAnalysisResult, type NormalizedFeedback } from '../analysis-schema';
import { buildAnalysisPrompt, type StructuredAnalysisPrompt } from './prompt';

export interface ProviderExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface AnalysisProviderMetadata extends ProviderExecutionResult {
  provider: string;
  model?: string;
  rawOutput: string;
}

export interface AnalysisReviewMetadata {
  reason: 'secondary_provider_failed' | 'material_disagreement';
  secondaryProviderMetadata: AnalysisProviderMetadata;
}

export interface AnalysisProviderConfig {
  model?: string;
}

export interface AnalysisRequest {
  provider: string;
  goal: Record<string, unknown>;
  parsedArtifact: Record<string, unknown>;
  rubric?: Record<string, unknown> | string;
  dimensions?: Array<Record<string, unknown>>;
  reviewMode: boolean;
  secondaryProvider?: string;
  model?: string;
  secondaryModel?: string;
  confidenceThreshold?: number;
  providerConfigs?: Record<string, AnalysisProviderConfig>;
  runner?: AnalysisProviderRunner;
}

export interface AnalysisResponse {
  status: AnalysisLifecycleStatus;
  result: NormalizedAnalysisResult | null;
  normalized_feedback: NormalizedFeedback | null;
  providerMetadata: AnalysisProviderMetadata;
  reviewMetadata?: AnalysisReviewMetadata;
  error?: string;
}

export interface AnalysisProviderInvocation {
  provider: string;
  model?: string;
  prompt: StructuredAnalysisPrompt;
}

export type AnalysisProviderRunner = (
  invocation: AnalysisProviderInvocation,
) => Promise<ProviderExecutionResult>;

function buildEmptyMetadata(provider: string, model?: string): AnalysisProviderMetadata {
  return {
    provider,
    model,
    stdout: '',
    stderr: '',
    exitCode: 1,
    rawOutput: '',
  };
}

function normalizeExecutionMetadata(
  provider: string,
  model: string | undefined,
  execution: ProviderExecutionResult,
): AnalysisProviderMetadata {
  return {
    provider,
    model,
    stdout: execution.stdout,
    stderr: execution.stderr,
    exitCode: execution.exitCode,
    rawOutput: execution.stdout,
  };
}

function resolveModel(
  provider: string,
  requestModel: string | undefined,
  providerConfigs?: Record<string, AnalysisProviderConfig>,
): string | undefined {
  return requestModel ?? providerConfigs?.[provider]?.model;
}

function hasMaterialDisagreement(
  primary: NormalizedAnalysisResult,
  secondary: NormalizedAnalysisResult,
): boolean {
  if (Math.abs(primary.score_estimate - secondary.score_estimate) >= 15) {
    return true;
  }

  const primaryWeaknesses = primary.top_weaknesses.map((value) => value.toLowerCase().trim());
  const secondaryWeaknesses = secondary.top_weaknesses.map((value) => value.toLowerCase().trim());

  if (primaryWeaknesses[0] && secondaryWeaknesses[0] && primaryWeaknesses[0] !== secondaryWeaknesses[0]) {
    return true;
  }

  return false;
}

function buildNormalizedFeedback(
  result: NormalizedAnalysisResult,
  lifecycleStatus: AnalysisLifecycleStatus,
): NormalizedFeedback | null {
  if (lifecycleStatus !== 'completed' && lifecycleStatus !== 'low_confidence') {
    return null;
  }
  return { ...result, status: lifecycleStatus as 'completed' | 'low_confidence' };
}

async function runSingleAnalysis(
  provider: string,
  model: string | undefined,
  prompt: StructuredAnalysisPrompt,
  runner: AnalysisProviderRunner,
  confidenceThreshold: number,
): Promise<AnalysisResponse> {
  let execution: ProviderExecutionResult;

  try {
    execution = await runner({ provider, model, prompt });
  } catch (error) {
    return {
      status: ANALYSIS_LIFECYCLE_STATUS.ANALYSIS_FAILED,
      result: null,
      normalized_feedback: null,
      providerMetadata: buildEmptyMetadata(provider, model),
      error: error instanceof Error ? error.message : 'Provider invocation failed.',
    };
  }

  const providerMetadata = normalizeExecutionMetadata(provider, model, execution);

  if (execution.exitCode !== 0) {
    return {
      status: ANALYSIS_LIFECYCLE_STATUS.ANALYSIS_FAILED,
      result: null,
      normalized_feedback: null,
      providerMetadata,
      error: execution.stderr || 'Provider exited unsuccessfully.',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(execution.stdout);
  } catch {
    return {
      status: ANALYSIS_LIFECYCLE_STATUS.ANALYSIS_FAILED,
      result: null,
      normalized_feedback: null,
      providerMetadata,
      error: 'Provider returned invalid JSON.',
    };
  }

  let normalized: NormalizedAnalysisResult;
  try {
    normalized = validateNormalizedAnalysisResult(parsed);
  } catch (error) {
    return {
      status: ANALYSIS_LIFECYCLE_STATUS.ANALYSIS_FAILED,
      result: null,
      normalized_feedback: null,
      providerMetadata,
      error: error instanceof Error ? error.message : 'Provider returned invalid normalized analysis.',
    };
  }

  const lifecycleStatus = getAnalysisStatusForResult(normalized, confidenceThreshold);

  return {
    status: lifecycleStatus,
    result: normalized,
    normalized_feedback: buildNormalizedFeedback(normalized, lifecycleStatus),
    providerMetadata,
  };
}

export async function runAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
  const runner = request.runner;
  const confidenceThreshold = request.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;
  const model = resolveModel(request.provider, request.model, request.providerConfigs);

  if (!runner) {
    return {
      status: ANALYSIS_LIFECYCLE_STATUS.ANALYSIS_FAILED,
      result: null,
      normalized_feedback: null,
      providerMetadata: buildEmptyMetadata(request.provider, model),
      error: 'No analysis provider runner configured.',
    };
  }

  const prompt = buildAnalysisPrompt({
    goal: request.goal,
    parsedArtifact: request.parsedArtifact,
    rubric: request.rubric,
    dimensions: request.dimensions,
  });

  const primary = await runSingleAnalysis(
    request.provider,
    model,
    prompt,
    runner,
    confidenceThreshold,
  );

  if (!request.reviewMode || !primary.result) {
    return primary;
  }

  const secondaryProvider = request.secondaryProvider;
  if (!secondaryProvider) {
    return primary;
  }

  const secondaryModel = resolveModel(
    secondaryProvider,
    request.secondaryModel,
    request.providerConfigs,
  );

  const secondary = await runSingleAnalysis(
    secondaryProvider,
    secondaryModel,
    prompt,
    runner,
    confidenceThreshold,
  );

  if (!secondary.result) {
    return {
      status: ANALYSIS_LIFECYCLE_STATUS.HUMAN_REVIEW_NEEDED,
      result: null,
      normalized_feedback: null,
      providerMetadata: primary.providerMetadata,
      reviewMetadata: {
        reason: 'secondary_provider_failed',
        secondaryProviderMetadata: secondary.providerMetadata,
      },
    };
  }

  if (hasMaterialDisagreement(primary.result, secondary.result)) {
    return {
      status: ANALYSIS_LIFECYCLE_STATUS.HUMAN_REVIEW_NEEDED,
      result: null,
      normalized_feedback: null,
      providerMetadata: primary.providerMetadata,
      reviewMetadata: {
        reason: 'material_disagreement',
        secondaryProviderMetadata: secondary.providerMetadata,
      },
    };
  }

  return primary;
}
