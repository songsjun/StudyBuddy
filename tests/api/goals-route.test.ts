import { POST } from '../../src/app/api/goals/route';
import { resetStudyGoalsForTests } from '../../src/lib/goals';

describe('POST /api/goals', () => {
  beforeEach(async () => {
    await resetStudyGoalsForTests();
  });

  it('creates the first active goal', async () => {
    const request = new Request('http://localhost/api/goals', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        targetName: 'LA-30 Reading',
        rubricVersion: '2024.1',
        dimensionSchemaVersion: '1.0.0',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      targetName: 'LA-30 Reading',
      rubricVersion: '2024.1',
      dimensionSchemaVersion: '1.0.0',
      status: 'active',
    });
    expect(body.id).toEqual(expect.any(String));
  });

  it('returns 409 when an active goal already exists', async () => {
    const firstRequest = new Request('http://localhost/api/goals', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        targetName: 'LA-30 Reading',
        rubricVersion: '2024.1',
        dimensionSchemaVersion: '1.0.0',
      }),
    });

    const secondRequest = new Request('http://localhost/api/goals', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        targetName: 'LA-30 Essay',
        rubricVersion: '2024.1',
        dimensionSchemaVersion: '1.0.0',
      }),
    });

    await POST(firstRequest);
    const response = await POST(secondRequest);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toMatchObject({
      code: 'ACTIVE_GOAL_EXISTS',
      error: 'An active study goal already exists.',
    });
    expect(body.activeGoal.targetName).toBe('LA-30 Reading');
  });

  it('returns 400 for a malformed payload shape', async () => {
    const request = new Request('http://localhost/api/goals', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(['not-an-object']),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Request body must be a JSON object.' });
  });

  it('returns 400 when targetName is missing', async () => {
    const request = new Request('http://localhost/api/goals', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        rubricVersion: '2024.1',
        dimensionSchemaVersion: '1.0.0',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'targetName must be a string.' });
  });

  it('returns 400 when rubricVersion is blank', async () => {
    const request = new Request('http://localhost/api/goals', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        targetName: 'LA-30 Reading',
        rubricVersion: '   ',
        dimensionSchemaVersion: '1.0.0',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'rubricVersion is required.' });
  });

  it('returns 400 when dimensionSchemaVersion is blank', async () => {
    const request = new Request('http://localhost/api/goals', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        targetName: 'LA-30 Reading',
        rubricVersion: '2024.1',
        dimensionSchemaVersion: '   ',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'dimensionSchemaVersion is required.' });
  });
});
