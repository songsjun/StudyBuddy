import {
  ActiveStudyGoalConflictError,
  createStudyGoal,
} from '../../../lib/goals';

type GoalCreationPayload = {
  targetName: string;
  rubricVersion: string;
  dimensionSchemaVersion: string;
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}

function isObjectPayload(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseGoalCreationPayload(value: unknown): GoalCreationPayload {
  if (!isObjectPayload(value)) {
    throw new TypeError('Request body must be a JSON object.');
  }

  return {
    targetName: value.targetName as string,
    rubricVersion: value.rubricVersion as string,
    dimensionSchemaVersion: value.dimensionSchemaVersion as string,
  };
}

export async function POST(request: Request): Promise<Response> {
  let payload: GoalCreationPayload;

  try {
    const parsedBody = await request.json();
    payload = parseGoalCreationPayload(parsedBody);
  } catch (error) {
    const message = error instanceof TypeError ? error.message : 'Invalid JSON body.';
    return json({ error: message }, 400);
  }

  try {
    const goal = await createStudyGoal(payload);
    return json(goal, 201);
  } catch (error) {
    if (error instanceof ActiveStudyGoalConflictError) {
      return json(
        {
          error: 'An active study goal already exists.',
          code: 'ACTIVE_GOAL_EXISTS',
          activeGoal: error.existingGoal,
        },
        409,
      );
    }

    if (error instanceof TypeError) {
      return json({ error: error.message }, 400);
    }

    return json({ error: 'Internal server error.' }, 500);
  }
}
