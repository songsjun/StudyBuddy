describe("getActiveStudyGoal", () => {
  afterEach(() => {
    jest.resetModules();
    delete (globalThis as typeof globalThis & { prisma?: unknown }).prisma;
  });

  it("returns null when there is no active goal", async () => {
    const findMany = jest.fn().mockResolvedValue([]);

    jest.doMock("@prisma/client", () => ({
      PrismaClient: jest.fn().mockImplementation(() => ({
        studyGoal: { findMany },
      })),
    }));

    const { getActiveStudyGoal } = await import("../src/lib/goals");

    await expect(getActiveStudyGoal()).resolves.toBeNull();
    expect(findMany).toHaveBeenCalledWith({
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
  });

  it("returns the active goal shape when exactly one active goal exists", async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        targetName: "AP Biology Unit 4",
        rubricVersion: "2026-01",
        dimensionSchemaVersion: "1.0.0",
        status: "active",
      },
    ]);

    jest.doMock("@prisma/client", () => ({
      PrismaClient: jest.fn().mockImplementation(() => ({
        studyGoal: { findMany },
      })),
    }));

    const { getActiveStudyGoal } = await import("../src/lib/goals");

    await expect(getActiveStudyGoal()).resolves.toEqual({
      targetName: "AP Biology Unit 4",
      rubricVersion: "2026-01",
      dimensionSchemaVersion: "1.0.0",
      status: "active",
    });
  });

  it("throws when multiple active goals exist", async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        targetName: "Newest Goal",
        rubricVersion: "v2",
        dimensionSchemaVersion: "v2",
        status: "active",
      },
      {
        targetName: "Older Goal",
        rubricVersion: "v1",
        dimensionSchemaVersion: "v1",
        status: "active",
      },
    ]);

    jest.doMock("@prisma/client", () => ({
      PrismaClient: jest.fn().mockImplementation(() => ({
        studyGoal: { findMany },
      })),
    }));

    const { getActiveStudyGoal } = await import("../src/lib/goals");

    await expect(getActiveStudyGoal()).rejects.toThrow("Multiple active study goals found");
  });
});
