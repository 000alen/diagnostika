import { logger } from "../src/logging";
import { buildGraph } from "../src/";
import { Snapshot } from "../src/types";
import { sonnet, titanEmbeddings } from "../src/models";

async function main() {
  logger.info("Starting symptom analysis");

  const snapshots: Array<Snapshot> = [
    {
      t: new Date(),
      descriptions: ["I have a runny nose"],
      exams: [
        {
          t: new Date(),
          description: "the patient has a high level of mucous",
        },
      ],
    },
  ];

  try {
    const graph = await buildGraph(
      {
        model: sonnet,
        embeddings: titanEmbeddings,
      },
      snapshots
    );

    logger.info("Symptom graph", { graph });

    logger.info("Successfully built symptom graph");
  } catch (error) {
    logger.error("Failed to build symptom graph", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

main().catch((error) => {
  logger.error("Application failed", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
