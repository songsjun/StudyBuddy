import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }

  return globalForPrisma.prisma;
}

export type ActiveStudyGoal = {
  targetName: string;
  rubricVersion: string;
  dimensionSchemaVersion: string;
  status: "active";
};

export async function getActiveStudyGoal(): Promise<ActiveStudyGoal | null> {
  const prisma = getPrismaClient();

  const goals = await prisma.studyGoal.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    take: 2,
    select: {
      targetName: true,
      rubricVersion: true,
      dimensionSchemaVersion: true,
      status: true,
    },
  });

  if (goals.length === 0) {
    return null;
  }

  if (goals.length > 1) {
    throw new Error("Multiple active study goals found");
  }

  const [goal] = goals;

  return {
    targetName: goal.targetName,
    rubricVersion: goal.rubricVersion,
    dimensionSchemaVersion: goal.dimensionSchemaVersion,
    status: "active",
  };
}
