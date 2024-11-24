import { createCallerFactory, procedure, router } from "@/trpc/trpc";
import { createContext } from "@/trpc/context";
import { z } from "zod";
import {
  Snapshot,
  buildGraph,
  sonnet,
  titanEmbeddings,
  Models,
  Exam,
} from "@bananus/g";
import {
  db,
  eq,
  snapshots,
  desc,
  and,
  snapshotDescriptions,
  exams,
  snapshotExams,
} from "@bananus/db";

const models: Models = {
  language: sonnet,
  embedding: titanEmbeddings,
};

async function getSnapshot(patientId: number, snapshotId: number) {
  const snapshot = await db
    .select()
    .from(snapshots)
    .where(
      and(eq(snapshots.patientId, patientId), eq(snapshots.id, snapshotId))
    )
    .then((rows) => rows[0]);

  return snapshot;
}

async function getLatestSnapshot(patientId: number) {
  const snapshot = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.patientId, patientId))
    .orderBy(desc(snapshots.t))
    .limit(1)
    .then((rows) => rows[0]);

  return snapshot;
}

async function getFullSnapshot(patientId: number, snapshotId: number) {
  const { id, t } = await getSnapshot(patientId, snapshotId);

  const descriptions = await db
    .select({ description: snapshotDescriptions.description })
    .from(snapshotDescriptions)
    .where(eq(snapshotDescriptions.snapshotId, id))
    .then((rows) => rows.map((row) => row.description));

  const _exams = await db
    .select({
      t: exams.t,
      name: exams.name,
      description: exams.description,
    })
    .from(exams)
    .leftJoin(snapshotExams, eq(snapshotExams.examId, exams.id))
    .where(eq(snapshotExams.snapshotId, id));

  return {
    t,
    descriptions,
    exams: _exams,
  } satisfies Snapshot;
}

export const appRouter = router({
  createPatient: procedure
    .input(z.object({ name: z.string(), rut: z.string() }))
    .mutation(async () => {}),

  createSnapshot: procedure
    .input(z.object({ patientId: z.number() }))
    .mutation(async ({ input: { patientId } }) => {
      await db.insert(snapshots).values({
        patientId,
        t: new Date(),
      });
    }),

  getSnapshot: procedure
    .input(z.object({ patientId: z.number(), snapshotId: z.number() }))
    .query(async ({ input: { patientId, snapshotId } }) => {
      return await getSnapshot(patientId, snapshotId);
    }),

  getLatestSnapshot: procedure
    .input(z.object({ patientId: z.number() }))
    .query(async ({ input: { patientId } }) => {
      return await getLatestSnapshot(patientId);
    }),

  addToSnapshot: procedure
    .input(
      z.object({
        patientId: z.number(),
        snapshotId: z.number().optional(),
        description: z.string(),
      })
    )
    .mutation(async ({ input: { patientId, snapshotId, description } }) => {
      const snapshot = !!snapshotId
        ? await getSnapshot(patientId, snapshotId)
        : await getLatestSnapshot(patientId);

      await db.insert(snapshotDescriptions).values({
        snapshotId: snapshot.id,
        description,
      });
    }),

  addExamToSnapshot: procedure
    .input(
      z.object({
        patientId: z.number(),
        snapshotId: z.number().optional(),
        exam: Exam,
      })
    )
    .mutation(async ({ input: { patientId, snapshotId, exam } }) => {
      const snapshot = !!snapshotId
        ? await getSnapshot(patientId, snapshotId)
        : await getLatestSnapshot(patientId);

      const insertedExam = await db
        .insert(exams)
        .values({
          patientId,
          t: exam.t,
          name: exam.name,
          description: exam.description,
        })
        .returning()
        .then((rows) => rows[0]);

      await db.insert(snapshotExams).values({
        snapshotId: snapshot.id,
        examId: insertedExam.id,
      });
    }),

  buildGraph: procedure
    .input(
      z.object({
        patientId: z.number(),
        snapshotId: z.number(),
      })
    )
    .mutation(async ({ input: { patientId, snapshotId } }) => {
      const snapshot = await getFullSnapshot(patientId, snapshotId);
      const { symptoms, graph } = await buildGraph(models, [snapshot]);

      return {
        symptoms,
        graph,
      };
    }),
});

export const createCaller = createCallerFactory(appRouter);

export const createAsyncCaller = async () => {
  const context = await createContext();
  return createCaller(context);
};

export type AppRouter = typeof appRouter;
