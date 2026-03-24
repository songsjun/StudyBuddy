import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type GoalRow = Record<string, unknown>;

type StudyGoalDelegate = {
  findFirst?: (args?: Record<string, unknown>) => Promise<GoalRow | null>;
  findMany?: (args?: Record<string, unknown>) => Promise<GoalRow[]>;
  create: (args: Record<string, unknown>) => Promise<GoalRow>;
  deleteMany: (args?: Record<string, unknown>) => Promise<unknown>;
};

type PrismaClientLike = Record<string, unknown> & {
  $transaction?: <T>(
    fn: (tx: Record<string, unknown>) => Promise<T>,
    options?: Record<string, unknown>,
  ) => Promise<T>;
};

export type ActiveStudyGoal = {
  id: string;
  targetName: string;
  rubricVersion: string;
  dimensionSchemaVersion: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type CreateStudyGoalInput = {
  targetName: string;
  rubricVersion: string;
  dimensionSchemaVersion: string;
};

export const activeStudyGoalSelect = {
  id: true,
  targetName: true,
  rubricVersion: true,
  dimensionSchemaVersion: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class ActiveStudyGoalConflictError extends Error {
  readonly existingGoal: ActiveStudyGoal;

  constructor(existingGoal: ActiveStudyGoal) {
    super('An active study goal already exists.');
    this.name = 'ActiveStudyGoalConflictError';
    this.existingGoal = existingGoal;
  }
}

let inMemoryGoals: ActiveStudyGoal[] = [];

function getStudyGoalDelegate(
  client: PrismaClientLike = prisma as unknown as PrismaClientLike,
): StudyGoalDelegate | null {
  const candidates = ['studyGoal', 'study_goal'];

  for (const key of candidates) {
    const value = client[key] as StudyGoalDelegate | undefined;

    if (
      value &&
      typeof value.create === 'function' &&
      typeof value.deleteMany === 'function' &&
      (typeof value.findFirst === 'function' || typeof value.findMany === 'function')
    ) {
      return value;
    }
  }

  return null;
}

function normalizeRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new TypeError(`${fieldName} must be a string.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new TypeError(`${fieldName} is required.`);
  }

  return normalized;
}

function readStringField(row: GoalRow, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  throw new TypeError(`Missing required goal field: ${keys[0]}.`);
}

function readOptionalDateField(
  row: GoalRow,
  ...keys: string[]
): Date | string | undefined {
  for (const key of keys) {
    const value = row[key];

    if (value instanceof Date || typeof value === 'string') {
      return value;
    }
  }

  return undefined;
}

function normalizeGoal(row: GoalRow): ActiveStudyGoal {
  return {
    id: readStringField(row, 'id'),
    targetName: readStringField(row, 'targetName', 'target_name'),
    rubricVersion: readStringField(row, 'rubricVersion', 'rubric_version'),
    dimensionSchemaVersion: readStringField(
      row,
      'dimensionSchemaVersion',
      'dimension_schema_version',
    ),
    status: readStringField(row, 'status'),
    createdAt: readOptionalDateField(row, 'createdAt', 'created_at'),
    updatedAt: readOptionalDateField(row, 'updatedAt', 'updated_at'),
  };
}

function buildCreatePayload(
  input: CreateStudyGoalInput,
  shape: 'camel' | 'snake',
): Record<string, unknown> {
  if (shape === 'snake') {
    return {
      target_name: input.targetName,
      rubric_version: input.rubricVersion,
      dimension_schema_version: input.dimensionSchemaVersion,
      status: 'active',
    };
  }

  return {
    targetName: input.targetName,
    rubricVersion: input.rubricVersion,
    dimensionSchemaVersion: input.dimensionSchemaVersion,
    status: 'active',
  };
}

function createInMemoryGoal(input: CreateStudyGoalInput): ActiveStudyGoal {
  const timestamp = new Date().toISOString();

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    targetName: input.targetName,
    rubricVersion: input.rubricVersion,
    dimensionSchemaVersion: input.dimensionSchemaVersion,
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function isPayloadShapeError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes('unknown argument') ||
    message.includes('unknown field') ||
    message.includes('argument') ||
    message.includes('field does not exist')
  );
}

async function findActiveStudyGoal(
  delegate: StudyGoalDelegate,
): Promise<ActiveStudyGoal | null> {
  if (typeof delegate.findFirst === 'function') {
    const row = await delegate.findFirst({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      select: activeStudyGoalSelect,
    });

    return row ? normalizeGoal(row) : null;
  }

  const rows = await delegate.findMany!({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' },
    select: activeStudyGoalSelect,
  });

  if (rows.length === 0) {
    return null;
  }

  if (rows.length > 1) {
    throw new Error('Multiple active study goals found.');
  }

  return normalizeGoal(rows[0]);
}

async function createStudyGoalRecord(
  delegate: StudyGoalDelegate,
  input: CreateStudyGoalInput,
): Promise<ActiveStudyGoal> {
  try {
    const created = await delegate.create({
      data: buildCreatePayload(input, 'camel'),
      select: activeStudyGoalSelect,
    });

    return normalizeGoal(created);
  } catch (error) {
    if (!isPayloadShapeError(error)) {
      throw error;
    }

    const created = await delegate.create({
      data: buildCreatePayload(input, 'snake'),
    });

    return normalizeGoal(created);
  }
}

export async function getActiveStudyGoal(): Promise<ActiveStudyGoal | null> {
  const delegate = getStudyGoalDelegate();

  if (!delegate) {
    const activeGoals = inMemoryGoals.filter((goal) => goal.status === 'active');

    if (activeGoals.length === 0) {
      return null;
    }

    if (activeGoals.length > 1) {
      throw new Error('Multiple active study goals found.');
    }

    return activeGoals[0];
  }

  return findActiveStudyGoal(delegate);
}

export async function createStudyGoal(
  input: CreateStudyGoalInput,
): Promise<ActiveStudyGoal> {
  const normalizedInput: CreateStudyGoalInput = {
    targetName: normalizeRequiredString(input.targetName, 'targetName'),
    rubricVersion: normalizeRequiredString(input.rubricVersion, 'rubricVersion'),
    dimensionSchemaVersion: normalizeRequiredString(
      input.dimensionSchemaVersion,
      'dimensionSchemaVersion',
    ),
  };

  const delegate = getStudyGoalDelegate();

  if (!delegate) {
    const existingGoal = await getActiveStudyGoal();

    if (existingGoal) {
      throw new ActiveStudyGoalConflictError(existingGoal);
    }

    const goal = createInMemoryGoal(normalizedInput);
    inMemoryGoals = [goal];
    return goal;
  }

  const client = prisma as unknown as PrismaClientLike;

  if (typeof client.$transaction === 'function') {
    return client.$transaction(
      async (tx) => {
        const transactionalDelegate = getStudyGoalDelegate(tx as PrismaClientLike);

        if (!transactionalDelegate) {
          throw new Error('Study goal delegate is unavailable in transaction.');
        }

        const existingGoal = await findActiveStudyGoal(transactionalDelegate);

        if (existingGoal) {
          throw new ActiveStudyGoalConflictError(existingGoal);
        }

        return createStudyGoalRecord(transactionalDelegate, normalizedInput);
      },
      { isolationLevel: 'Serializable' },
    );
  }

  const existingGoal = await getActiveStudyGoal();

  if (existingGoal) {
    throw new ActiveStudyGoalConflictError(existingGoal);
  }

  return createStudyGoalRecord(delegate, normalizedInput);
}

export async function resetStudyGoalsForTests(): Promise<void> {
  inMemoryGoals = [];

  const delegate = getStudyGoalDelegate();

  if (!delegate) {
    return;
  }

  await delegate.deleteMany();
}
