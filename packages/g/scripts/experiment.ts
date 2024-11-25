import { logger } from "@bananus/logging";
import {
  db,
  eq,
  exams,
  graphs,
  snapshotDescriptions,
  snapshotExams,
} from "@bananus/db";
import { Snapshot } from "../src/types";
import { buildGraph, diagnose, Models, sonnet, titanEmbeddings } from "../src";

const models: Models = {
  language: sonnet,
  embedding: titanEmbeddings,
};

const PATIENT_ID = 15;
const SNAPSHOT_ID = 4;

async function main() {
  const _descriptions = await db
    .select({ description: snapshotDescriptions.description })
    .from(snapshotDescriptions)
    .where(eq(snapshotDescriptions.patientId, PATIENT_ID));

  logger.info(`Found ${_descriptions.length} descriptions`);

  const _exams = await db
    .select({
      name: exams.name,
      description: exams.description,
    })
    .from(exams)
    .where(eq(exams.patientId, PATIENT_ID))
    .innerJoin(snapshotExams, eq(exams.id, snapshotExams.examId));

  logger.info(`Found ${_exams.length} exams`);

  const snapshot: Snapshot = {
    t: new Date(),
    descriptions: _descriptions.map((d) => d.description),
    exams: _exams.map((e) => ({
      t: new Date(),
      name: e.name,
      description: e.description,
    })),
  };

  logger.info("Building graph");

  const { graph, symptoms } = await buildGraph(models, [snapshot]);

  logger.info("Diagnosing");

  const insertedGraph = await db
    .insert(graphs)
    .values({
      snapshotId: SNAPSHOT_ID,
      symptoms,
      graph,
    })
    .returning()
    .then((rows) => rows[0]);

  logger.info("Inserted graph", { id: insertedGraph.id });

  const diagnosis = await diagnose(symptoms, 0.5);

  if (diagnosis)
    await db
      .update(graphs)
      .set({ diagnosis: diagnosis.candidate })
      .where(eq(graphs.id, insertedGraph.id));

  logger.info("Diagnosis", {
    diagnosis: diagnosis?.candidate?.name,
    similarity: diagnosis?.similarity,
  });
}

main().catch((error) => {
  console.error(error);

  logger.error("Application failed", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
