export type SubmissionType = 'pasted_text' | 'source_link';
export type ArtifactType = 'pasted_text' | 'source_link';
export type SubmissionStatus = 'uploaded';
export type StudyGoalStatus = 'active' | 'completed' | 'archived';

export interface CreateSubmissionInput {
  studyGoalId: string;
  submissionType: SubmissionType;
  notes?: string;
  pastedText?: string;
  sourceLink?: string;
}

export interface SubmissionRecord {
  id: string;
  studyGoalId: string;
  submissionType: SubmissionType;
  notes: string;
  status: SubmissionStatus;
  createdAt: string;
}

export interface SubmissionArtifactRecord {
  id: string;
  submissionId: string;
  studyGoalId: string;
  artifactType: ArtifactType;
  value: string;
  createdAt: string;
}

interface StudyGoalRecord {
  id: string;
  status: StudyGoalStatus;
}

export interface CreateSubmissionResult {
  submission: SubmissionRecord;
  artifact: SubmissionArtifactRecord;
}

export class InvalidSubmissionPayloadError extends Error {}
export class StudyGoalNotActiveError extends Error {}

const initialStudyGoals: StudyGoalRecord[] = [
  { id: 'goal_1', status: 'active' },
  { id: 'goal_2', status: 'completed' },
  { id: 'goal_3', status: 'archived' }
];

let studyGoals: StudyGoalRecord[] = initialStudyGoals.map((goal) => ({ ...goal }));
let submissions: SubmissionRecord[] = [];
let artifacts: SubmissionArtifactRecord[] = [];
let submissionCounter = 1;
let artifactCounter = 1;

function normalizeRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new InvalidSubmissionPayloadError(`${fieldName} is required.`);
  }

  return value.trim();
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getArtifactDetails(input: CreateSubmissionInput): {
  artifactType: ArtifactType;
  artifactValue: string;
} {
  const pastedText = normalizeOptionalString(input.pastedText);
  const sourceLink = normalizeOptionalString(input.sourceLink);

  if (pastedText && sourceLink) {
    throw new InvalidSubmissionPayloadError('Provide only one of pastedText or sourceLink.');
  }

  if (input.submissionType === 'pasted_text') {
    if (!pastedText) {
      throw new InvalidSubmissionPayloadError('pastedText is required for pasted_text submissions.');
    }

    return {
      artifactType: 'pasted_text',
      artifactValue: pastedText
    };
  }

  if (input.submissionType === 'source_link') {
    if (!sourceLink) {
      throw new InvalidSubmissionPayloadError('sourceLink is required for source_link submissions.');
    }

    return {
      artifactType: 'source_link',
      artifactValue: sourceLink
    };
  }

  throw new InvalidSubmissionPayloadError('submissionType must be pasted_text or source_link.');
}

export function createSubmissionWithArtifact(input: CreateSubmissionInput): CreateSubmissionResult {
  const studyGoalId = normalizeRequiredString(input.studyGoalId, 'studyGoalId');
  const notes = normalizeOptionalString(input.notes) ?? '';

  if (input.submissionType !== 'pasted_text' && input.submissionType !== 'source_link') {
    throw new InvalidSubmissionPayloadError('submissionType must be pasted_text or source_link.');
  }

  const studyGoal = studyGoals.find((goal) => goal.id === studyGoalId);
  if (!studyGoal || studyGoal.status !== 'active') {
    throw new StudyGoalNotActiveError('The referenced study goal is not active.');
  }

  const { artifactType, artifactValue } = getArtifactDetails(input);
  const createdAt = new Date().toISOString();

  const submission: SubmissionRecord = {
    id: `submission_${submissionCounter++}`,
    studyGoalId,
    submissionType: input.submissionType,
    notes,
    status: 'uploaded',
    createdAt
  };

  submissions.push(submission);

  const artifact: SubmissionArtifactRecord = {
    id: `artifact_${artifactCounter++}`,
    submissionId: submission.id,
    studyGoalId,
    artifactType,
    value: artifactValue,
    createdAt
  };

  artifacts.push(artifact);

  return {
    submission,
    artifact
  };
}

export function resetSubmissionStore(): void {
  studyGoals = initialStudyGoals.map((goal) => ({ ...goal }));
  submissions = [];
  artifacts = [];
  submissionCounter = 1;
  artifactCounter = 1;
}

export function getSubmissionStoreSnapshot(): {
  studyGoals: StudyGoalRecord[];
  submissions: SubmissionRecord[];
  artifacts: SubmissionArtifactRecord[];
} {
  return {
    studyGoals: studyGoals.map((goal) => ({ ...goal })),
    submissions: submissions.map((submission) => ({ ...submission })),
    artifacts: artifacts.map((artifact) => ({ ...artifact }))
  };
}
