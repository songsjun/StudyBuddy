import { ActiveStudyGoalConflictError, createStudyGoal } from '../../../lib/goals';

type GoalRequestBody = {
  targetName?: unknown;
  rubricVersion?: unknown;
  dimensionSchemaVersion?: unknown;
};

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  let body: GoalRequestBody;

  try {
    const parsed = (await request.json()) as unknown;

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return json({ error: 'Request body must be a JSON object.' }, { status: 400 });
    }

    body = parsed as GoalRequestBody;
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  try {
    const goal = await createStudyGoal({
      targetName: body.targetName as string,
      rubricVersion: body.rubricVersion as string,
      dimensionSchemaVersion: body.dimensionSchemaVersion as string,
    });

    return json(goal, { status: 201 });
  } catch (error) {
    if (error instanceof ActiveStudyGoalConflictError) {
      return json(
        {
          code: 'ACTIVE_GOAL_EXISTS',
          error: error.message,
          activeGoal: error.existingGoal,
        },
        { status: 409 },
      );
    }

    if (error instanceof TypeError) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ error: 'Internal server error.' }, { status: 500 });
  }
}
