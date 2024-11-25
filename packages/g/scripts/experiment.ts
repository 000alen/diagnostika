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

async function main() {
  const _descriptions = await db
    .select({ description: snapshotDescriptions.description })
    .from(snapshotDescriptions);

  logger.info(`Found ${_descriptions.length} descriptions`);

  const _exams = await db
    .select({
      name: exams.name,
      description: exams.description,
    })
    .from(exams)
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
      snapshotId: 4,
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
      .set({ diagnosis })
      .where(eq(graphs.id, insertedGraph.id));

  logger.info("Diagnosis", { diagnosis: diagnosis?.name });
}

main().catch((error) => {
  console.error(error);

  logger.error("Application failed", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
