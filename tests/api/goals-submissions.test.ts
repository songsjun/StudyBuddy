import { POST as createGoalRoute } from '../../src/app/api/goals/route';
import { POST as createSubmissionRoute } from '../../src/app/api/submissions/route';
import { resetStudyGoalsForTests } from '../../src/lib/goals';
import { resetSubmissionStore } from '../../src/lib/submissions';

type JsonBody = Record<string, unknown>;

function buildJsonRequest(url: string, method: string, payload?: unknown): Request {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
}

async function readJson(response: Response): Promise<JsonBody> {
  return (await response.json()) as JsonBody;
}

describe('POST /api/goals', () => {
  beforeEach(async () => {
    await resetStudyGoalsForTests();
    resetSubmissionStore();
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

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      targetName: 'LA-30 reading + essay',
      rubricVersion: 'v1',
      dimensionSchemaVersion: 'v1',
      status: 'active',
    });
    expect(typeof body.id).toBe('string');
  });

  it('returns 409 when an active goal already exists', async () => {
    await createGoalRoute(
      buildJsonRequest('http://localhost/api/goals', 'POST', {
        targetName: 'First goal',
        rubricVersion: 'v1',
        dimensionSchemaVersion: 'v1',
      }),
    );

    const response = await createGoalRoute(
      buildJsonRequest('http://localhost/api/goals', 'POST', {
        targetName: 'Second goal',
        rubricVersion: 'v1',
        dimensionSchemaVersion: 'v1',
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(409);
    expect(body).toMatchObject({ code: 'ACTIVE_GOAL_EXISTS' });
  });

  it('returns 400 when targetName is missing', async () => {
    const response = await createGoalRoute(
      buildJsonRequest('http://localhost/api/goals', 'POST', {
        rubricVersion: 'v1',
        dimensionSchemaVersion: 'v1',
      }),
    );

    expect(response.status).toBe(400);
  });
});

describe('POST /api/submissions', () => {
  beforeEach(async () => {
    await resetStudyGoalsForTests();
    resetSubmissionStore();
  });

  it('creates a pasted-text submission for a pre-seeded active goal', async () => {
    const response = await createSubmissionRoute(
      buildJsonRequest('http://localhost/api/submissions', 'POST', {
        studyGoalId: 'goal_1',
        submissionType: 'pasted_text',
        notes: 'Timed reading response draft',
        pastedText: 'My revised essay paragraph about the passage.',
      }),
    );
    const body = await readJson(response);

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      submission: expect.objectContaining({
        studyGoalId: 'goal_1',
        submissionType: 'pasted_text',
        status: 'uploaded',
      }),
      artifact: expect.objectContaining({
        artifactType: 'pasted_text',
        studyGoalId: 'goal_1',
      }),
    });
  });

  it('returns 400 when pastedText is missing for pasted_text submission', async () => {
    const response = await createSubmissionRoute(
      buildJsonRequest('http://localhost/api/submissions', 'POST', {
        studyGoalId: 'goal_1',
        submissionType: 'pasted_text',
        notes: 'Missing content',
      }),
    );

    expect(response.status).toBe(400);
  });

  it('returns 409 when the study goal does not exist or is not active', async () => {
    const response = await createSubmissionRoute(
      buildJsonRequest('http://localhost/api/submissions', 'POST', {
        studyGoalId: 'nonexistent-goal',
        submissionType: 'pasted_text',
        pastedText: 'Some text',
      }),
    );

    expect(response.status).toBe(409);
  });
});