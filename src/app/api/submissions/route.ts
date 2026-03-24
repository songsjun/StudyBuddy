import {
  InvalidSubmissionPayloadError,
  StudyGoalNotActiveError,
  createSubmissionWithArtifact,
  type CreateSubmissionInput
} from '@/lib/submissions';

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json'
    }
  });
}

export async function POST(request: Request): Promise<Response> {
  let payload: Partial<CreateSubmissionInput>;

  try {
    payload = (await request.json()) as Partial<CreateSubmissionInput>;
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }

  const hasPastedText = typeof payload.pastedText === 'string' && payload.pastedText.trim().length > 0;
  const hasSourceLink = typeof payload.sourceLink === 'string' && payload.sourceLink.trim().length > 0;

  if (!hasPastedText && !hasSourceLink) {
    return json({ error: 'Either pastedText or sourceLink is required.' }, 400);
  }

  if (hasPastedText && hasSourceLink) {
    return json({ error: 'Provide only one of pastedText or sourceLink.' }, 400);
  }

  try {
    const result = createSubmissionWithArtifact({
      studyGoalId: payload.studyGoalId ?? '',
      submissionType: payload.submissionType as CreateSubmissionInput['submissionType'],
      notes: payload.notes,
      pastedText: payload.pastedText,
      sourceLink: payload.sourceLink
    });

    return json(result, 201);
  } catch (error) {
    if (error instanceof InvalidSubmissionPayloadError) {
      return json({ error: error.message }, 400);
    }

    if (error instanceof StudyGoalNotActiveError) {
      return json({ error: error.message }, 409);
    }

    return json({ error: 'Internal server error.' }, 500);
  }
}
