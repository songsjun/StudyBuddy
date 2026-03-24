import { createApiTestServer } from '../helpers/api-test-server';

describe('goals and submissions API', () => {
  it('creates one active goal and rejects a second active goal', async () => {
    const server = createApiTestServer();

    const firstResponse = await server.client.post('/api/goals').send({
      targetName: 'LA-30 reading + essay',
      rubricVersion: 'v1',
      dimensionSchemaVersion: 'v1',
    });

    expect(firstResponse.status).toBe(201);
    expect(firstResponse.body).toMatchObject({
      id: 'goal_1',
      targetName: 'LA-30 reading + essay',
      rubricVersion: 'v1',
      dimensionSchemaVersion: 'v1',
      status: 'active',
    });

    const secondResponse = await server.client.post('/api/goals').send({
      targetName: 'LA-30 reading + essay',
      rubricVersion: 'v1',
      dimensionSchemaVersion: 'v1',
    });

    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body).toEqual({
      error: 'An active study goal already exists',
    });
  });

  it('accepts a pasted-text submission for an existing study goal', async () => {
    const server = createApiTestServer();

    await server.client.post('/api/goals').send({
      targetName: 'LA-30 reading + essay',
      rubricVersion: 'v1',
      dimensionSchemaVersion: 'v1',
    });

    const submissionResponse = await server.client.post('/api/submissions').send({
      studyGoalId: 'goal_1',
      submissionType: 'pasted_text',
      pastedText: 'draft',
    });

    expect(submissionResponse.status).toBe(201);
    expect(submissionResponse.body).toMatchObject({
      id: 'submission_1',
      studyGoalId: 'goal_1',
      submissionType: 'pasted_text',
      pastedText: 'draft',
    });
  });

  it('rejects a submission missing both pastedText and sourceLink', async () => {
    const server = createApiTestServer();

    await server.client.post('/api/goals').send({
      targetName: 'LA-30 reading + essay',
      rubricVersion: 'v1',
      dimensionSchemaVersion: 'v1',
    });

    const submissionResponse = await server.client.post('/api/submissions').send({
      studyGoalId: 'goal_1',
      submissionType: 'pasted_text',
    });

    expect(submissionResponse.status).toBe(400);
    expect(submissionResponse.body).toEqual({
      error: 'Either pastedText or sourceLink is required',
    });
  });
});
