import { createApiTestServer, type ApiTestServer } from '../helpers/api-test-server';

describe('goals and submissions API', () => {
  let server: ApiTestServer;

  beforeEach(() => {
    server = createApiTestServer();
  });

  afterEach(async () => {
    await server.close();
  });

  it('creates one active goal and rejects a second active goal', async () => {
    const firstResponse = await server.client.post('/api/goals').send({
      targetName: 'LA-30 reading + essay',
      rubricVersion: 'v1',
      dimensionSchemaVersion: 'v1',
    });

    expect(firstResponse.status).toBe(201);
    expect(firstResponse.body).toMatchObject({
      id: expect.any(String),
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
    expect(secondResponse.body).toHaveProperty('error');
  });

  it('accepts a pasted-text submission for an existing study goal', async () => {
    const goalResponse = await server.client.post('/api/goals').send({
      targetName: 'LA-30 reading + essay',
      rubricVersion: 'v1',
      dimensionSchemaVersion: 'v1',
    });

    const submissionResponse = await server.client.post('/api/submissions').send({
      studyGoalId: goalResponse.body.id,
      submissionType: 'pasted_text',
      pastedText: 'draft',
    });

    expect(submissionResponse.status).toBe(201);
    expect(submissionResponse.body).toMatchObject({
      submission: {
        id: expect.any(String),
        studyGoalId: goalResponse.body.id,
        submissionType: 'pasted_text',
      },
      artifact: {
        id: expect.any(String),
        submissionId: expect.any(String),
      },
    });
  });

  it('rejects a submission missing both pastedText and sourceLink', async () => {
    const goalResponse = await server.client.post('/api/goals').send({
      targetName: 'LA-30 reading + essay',
      rubricVersion: 'v1',
      dimensionSchemaVersion: 'v1',
    });

    const submissionResponse = await server.client.post('/api/submissions').send({
      studyGoalId: goalResponse.body.id,
      submissionType: 'pasted_text',
    });

    expect(submissionResponse.status).toBe(400);
    expect(submissionResponse.body).toEqual({
      error: 'Either pastedText or sourceLink is required.',
    });
  });
});
