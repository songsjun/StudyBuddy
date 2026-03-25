import { GET as getGoalsRoute, POST as createGoalRoute } from '../../src/app/api/goals/route';
import { POST as createSubmissionRoute } from '../../src/app/api/submissions/route';
import { resetStudyGoalsForTests } from '../../src/lib/goals';
import { resetSubmissionStore } from '../../src/lib/submissions';

type JsonObject = Record<string, unknown>;

function buildJsonRequest(url: string, method: string, payload?: unknown): Request {
  return new Request(url, {
    method,
    headers: {
      'content-type': 'application/json',
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
}

async function readJson(response: Response): Promise<JsonObject> {
  return (await response.json()) as JsonObject;
}

function getObject(value: unknown): JsonObject | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return undefined;
}

function readId(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

describe('goal and submission routes', () => {
  beforeEach(async () => {
    await resetStudyGoalsForTests();
    await resetSubmissionStore();
  });

  it('creates a new study goal and returns 201', async () => {
    const response = await createGoalRoute(
      buildJsonRequest('http://localhost/api/goals', 'POST', {
        targetName: 'LA-30 reading + essay',
        rubricVersion: 'v1',
        dimensionSchemaVersion: 'v1',
      }),
    );
    const body = await readJson(response);
    const activeGoal = getObject(body.activeGoal);

    expect(response.status).toBe(201);
    expect(activeGoal).toMatchObject({
      targetName: 'LA-30 reading + essay',
      rubricVersion: 'v1',
      dimensionSchemaVersion: 'v1',
      status: 'active',
    });
    expect(readId(activeGoal?.id)).toEqual(expect.any(String));
  });

  it('returns 409 when an active goal already exists', async () => {
    await createGoalRoute(
      buildJsonRequest('http://localhost/api/goals', 'POST', {
        targetName: 'LA-30 reading + essay',
        rubricVersion: 'v1',
        dimensionSchemaVersion: 'v1',
      }),
    );

    const response = await createGoalRoute(
      buildJsonRequest('http://localhost/api/goals', 'POST', {
        targetName: 'Second goal',
        rubricVersion: 'v2',
        dimensionSchemaVersion: 'v2',
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(409);
    expect(body.code).toBe('ACTIVE_GOAL_EXISTS');
    expect(getObject(body.activeGoal)).toMatchObject({
      targetName: 'LA-30 reading + essay',
      status: 'active',
    });
  });

  it('returns 400 when targetName is missing', async () => {
    const response = await createGoalRoute(
      buildJsonRequest('http://localhost/api/goals', 'POST', {
        rubricVersion: 'v1',
        dimensionSchemaVersion: 'v1',
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it('creates a pasted-text submission for a pre-seeded active goal', async () => {
    const createGoalResponse = await createGoalRoute(
      buildJsonRequest('http://localhost/api/goals', 'POST', {
        targetName: 'LA-30 reading + essay',
        rubricVersion: 'v1',
        dimensionSchemaVersion: 'v1',
      }),
    );
    const createGoalBody = await readJson(createGoalResponse);
    const studyGoalId = readId(getObject(createGoalBody.activeGoal)?.id);

    const getGoalResponse = await getGoalsRoute();
    const getGoalBody = await readJson(getGoalResponse);

    expect(getGoalResponse.status).toBe(200);
    expect(readId(getObject(getGoalBody.activeGoal)?.id)).toBe(studyGoalId);

    const submissionResponse = await createSubmissionRoute(
      buildJsonRequest('http://localhost/api/submissions', 'POST', {
        studyGoalId,
        submissionType: 'pasted_text',
        notes: 'Timed reading response draft',
        pastedText: 'My revised essay paragraph about the passage.',
      }),
    );
    const submissionBody = await readJson(submissionResponse);

    expect(submissionResponse.status).toBe(201);
    expect(submissionBody).toMatchObject({
      status: 'uploaded',
      submissionType: 'pasted_text',
    });
    expect(
      readId(submissionBody.submissionId) ??
        readId(getObject(submissionBody.submission)?.id),
    ).toEqual(expect.any(String));
    expect(
      readId(submissionBody.artifactId) ??
        readId(getObject(submissionBody.artifact)?.id),
    ).toEqual(expect.any(String));
  });

  it('returns 400 when pastedText is missing for pasted_text submission', async () => {
    const createGoalResponse = await createGoalRoute(
      buildJsonRequest('http://localhost/api/goals', 'POST', {
        targetName: 'LA-30 reading + essay',
        rubricVersion: 'v1',
        dimensionSchemaVersion: 'v1',
      }),
    );
    const createGoalBody = await readJson(createGoalResponse);
    const studyGoalId = readId(getObject(createGoalBody.activeGoal)?.id);

    const submissionResponse = await createSubmissionRoute(
      buildJsonRequest('http://localhost/api/submissions', 'POST', {
        studyGoalId,
        submissionType: 'pasted_text',
        notes: 'Missing content payload',
      }),
    );

    expect(submissionResponse.status).toBe(400);
  });

  it('returns 409 when the study goal does not exist or is not active', async () => {
    const submissionResponse = await createSubmissionRoute(
      buildJsonRequest('http://localhost/api/submissions', 'POST', {
        studyGoalId: 'missing-goal',
        submissionType: 'pasted_text',
        notes: 'Should fail without an active goal',
        pastedText: 'Short response text',
      }),
    );

    expect(submissionResponse.status).toBe(409);
  });
});
