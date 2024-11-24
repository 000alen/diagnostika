import { createCallerFactory, procedure, router } from "@/trpc/trpc";
import { createContext } from "@/trpc/context";
import { z } from "zod";
import {
  Snapshot,
  buildGraph,
  diagnose,
  sonnet,
  titanEmbeddings,
  Models,
  Exam,
  SymptomWithEmbedding,
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
  graphs,
  queue,
  patients,
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
  getQueue: procedure.query(async () => {
    return await db
      .select({
        t: queue.t,
        priority: queue.priority,
        patientId: queue.patientId,
        patientName: patients.name,
      })
      .from(queue)
      .leftJoin(patients, eq(queue.patientId, patients.id))
      .orderBy(desc(queue.priority), desc(queue.t));
  }),

  addToQueue: procedure
    .input(z.object({ patientId: z.number(), priority: z.number() }))
    .mutation(async ({ input: { patientId, priority } }) => {
      await db.insert(queue).values({
        patientId,
        priority,
        t: new Date(),
      });
    }),

  removeFromQueue: procedure
    .input(z.object({ patientId: z.number() }))
    .mutation(async ({ input: { patientId } }) => {
      await db.delete(queue).where(eq(queue.patientId, patientId));
    }),

  createPatient: procedure
    .input(z.object({ name: z.string(), rut: z.string() }))
    .mutation(async ({ input: { name, rut } }) => {
      const insertedPatient = await db
        .insert(patients)
        .values({
          name,
          rut,
        })
        .returning()
        .then((rows) => rows[0]);

      return insertedPatient;
    }),

  createSnapshot: procedure
    .input(z.object({ patientId: z.number() }))
    .mutation(async ({ input: { patientId } }) => {
      await db.insert(snapshots).values({
        patientId,
        t: new Date(),
      });
    }),

  getExams: procedure
    .input(z.object({ patientId: z.number() }))
    .query(async ({ input: { patientId } }) => {
      return await db
        .select()
        .from(exams)
        .where(eq(exams.patientId, patientId))
        .orderBy(desc(exams.t));
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
        snapshotId: z.number().optional(),
      })
    )
    .mutation(async ({ input: { patientId, snapshotId } }) => {
      if (!snapshotId) {
        const snapshot = await getLatestSnapshot(patientId);
        snapshotId = snapshot.id;
      }

      const snapshot = await getFullSnapshot(patientId, snapshotId);
      const { symptoms, graph } = await buildGraph(models, [snapshot]);

      const insertedGraph = await db
        .insert(graphs)
        .values({
          snapshotId,
          symptoms,
          graph,
        })
        .returning()
        .then((rows) => rows[0]);

      return {
        graphId: insertedGraph.id,
        symptoms,
        graph,
      };
    }),

  diagnose: procedure
    .input(z.object({ graphId: z.string(), threshold: z.number().optional() }))
    .mutation(async ({ input: { graphId, threshold } }) => {
      const graph = await db
        .select()
        .from(graphs)
        .where(eq(graphs.id, graphId))
        .then((rows) => rows[0]);

      const diagnosis = await diagnose(
        graph.symptoms as Array<SymptomWithEmbedding>,
        threshold ?? 0.6
      );

      if (diagnosis)
        await db
          .update(graphs)
          .set({ diagnosis })
          .where(eq(graphs.id, graphId));

      return diagnosis;
    }),
});

export const createCaller = createCallerFactory(appRouter);

export const createAsyncCaller = async () => {
  const context = await createContext();
  return createCaller(context);
};

export type AppRouter = typeof appRouter;
