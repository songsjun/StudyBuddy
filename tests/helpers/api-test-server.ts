import express, { type Express } from 'express';
import request from 'supertest';

type StudyGoal = {
  id: string;
  targetName: string;
  rubricVersion: string;
  dimensionSchemaVersion: string;
  status: 'active';
};

type Submission = {
  id: string;
  studyGoalId: string;
  submissionType: 'pasted_text';
  pastedText?: string;
  sourceLink?: string;
};

export type ApiTestServer = {
  app: Express;
  client: ReturnType<typeof request>;
};

export function createApiTestServer(): ApiTestServer {
  const app = express();
  app.use(express.json());

  let goalCounter = 0;
  let submissionCounter = 0;
  const goals: StudyGoal[] = [];
  const submissions: Submission[] = [];

  app.post('/api/goals', (req, res) => {
    const { targetName, rubricVersion, dimensionSchemaVersion } = req.body ?? {};

    if (!targetName || !rubricVersion || !dimensionSchemaVersion) {
      return res.status(400).json({ error: 'Missing required goal fields' });
    }

    if (goals.some((goal) => goal.status === 'active')) {
      return res.status(409).json({ error: 'An active study goal already exists' });
    }

    goalCounter += 1;
    const goal: StudyGoal = {
      id: `goal_${goalCounter}`,
      targetName,
      rubricVersion,
      dimensionSchemaVersion,
      status: 'active',
    };

    goals.push(goal);
    return res.status(201).json(goal);
  });

  app.post('/api/submissions', (req, res) => {
    const { studyGoalId, submissionType, pastedText, sourceLink } = req.body ?? {};

    if (!studyGoalId || !submissionType) {
      return res.status(400).json({ error: 'Missing required submission fields' });
    }

    if (!goals.some((goal) => goal.id === studyGoalId)) {
      return res.status(404).json({ error: 'Study goal not found' });
    }

    if (!pastedText && !sourceLink) {
      return res.status(400).json({ error: 'Either pastedText or sourceLink is required' });
    }

    submissionCounter += 1;
    const submission: Submission = {
      id: `submission_${submissionCounter}`,
      studyGoalId,
      submissionType,
      ...(pastedText ? { pastedText } : {}),
      ...(sourceLink ? { sourceLink } : {}),
    };

    submissions.push(submission);
    return res.status(201).json(submission);
  });

  return {
    app,
    client: request(app),
  };
}
