import "dotenv/config";
import { logger } from "./logging";

import {
  embed,
  generateObject,
  cosineSimilarity,
  LanguageModel,
  EmbeddingModel,
} from "ai";
import { z } from "zod";
import {
  Criteria,
  CriteriaWithEmbedding,
  Evaluation,
  Exam,
  Examinable,
  ExaminableWithEmbedding,
  Snapshot,
  Symptom,
  SymptomWithEmbedding,
} from "./types";
import { flatten } from "./utils";
import { CRITERION, EXAMINABLES, ready, SYMPTOMS } from "./db";
import {
  PROMPT_EVALUATE_SYMPTOM,
  PROMPT_EXTRACT_EXAMINABLES,
  PROMPT_EXTRACT_SYMPTOMS,
} from "./prompts";
import { gpt4o, openaiEmbeddings } from "./models";

interface Models {
  model: LanguageModel;
  embeddings: EmbeddingModel<string>;
}

// Add threshold constants
const SIMILARITY_THRESHOLDS = {
  RELATED_SYMPTOMS: 0.5, // Used in getRelatedSymptomsFromExaminable
} as const;

async function extractSymptomsFromDescription(
  { model, embeddings }: Models,
  description: string
): Promise<Array<SymptomWithEmbedding>> {
  logger.debug("Extracting symptoms from description", { description });

  const { object } = await generateObject({
    model,
    schema: z.object({
      symptoms: Symptom.array(),
    }),
    messages: [
      {
        role: "system",
        content: PROMPT_EXTRACT_SYMPTOMS,
      },
      {
        role: "user",
        content: description,
      },
    ],
  });

  logger.debug("Extracted symptoms, adding embeddings", {
    symptomCount: object.symptoms.length,
  });

  const withEmbeddings = await Promise.all(
    object.symptoms.map(async (symptom) => {
      const { embedding } = await embed({
        model: embeddings,
        value: `${symptom.name}: ${symptom.description}`,
      });

      return {
        ...symptom,
        embedding,
      };
    })
  );

  logger.debug("Completed symptom extraction with embeddings", {
    symptomCount: withEmbeddings.length,
  });
  return withEmbeddings;
}

async function extractSymptomsFromDescriptions(
  models: Models,
  descriptions: string[]
) {
  const nSymptoms = await Promise.all(
    descriptions.map((d) => extractSymptomsFromDescription(models, d))
  );

  return flatten(nSymptoms);
}

async function extractExaminablesFromExam(
  { model, embeddings }: Models,
  exam: Exam
): Promise<Array<ExaminableWithEmbedding>> {
  logger.debug("Extracting examinables from exam", { exam });

  const { object } = await generateObject({
    model,
    schema: z.object({
      examinables: Examinable.array(),
    }),
    messages: [
      {
        role: "system",
        content: PROMPT_EXTRACT_EXAMINABLES,
      },
      {
        role: "user",
        content: exam.description,
      },
    ],
  });

  logger.debug("Extracted examinables, adding embeddings", {
    examinableCount: object.examinables.length,
  });

  const withEmbeddings = await Promise.all(
    object.examinables.map(async (examinable) => {
      const { embedding } = await embed({
        model: embeddings,
        value: `${examinable.name}: ${examinable.description}`,
      });

      return {
        ...examinable,
        embedding,
      };
    })
  );

  logger.debug("Completed examinable extraction with embeddings", {
    examinableCount: withEmbeddings.length,
  });
  return withEmbeddings;
}

async function getRelatedSymptomsFromExaminable(
  examinable: ExaminableWithEmbedding
): Promise<Array<SymptomWithEmbedding>> {
  logger.debug("Finding related symptoms for examinable", {
    examinableName: examinable.name,
  });

  await ready;

  const similarities = EXAMINABLES.map((e) =>
    cosineSimilarity(examinable.embedding, e.embedding)
  );

  const maxSimilarity = Math.max(...similarities);
  const maxIndex = similarities.indexOf(maxSimilarity);
  logger.debug("Similarity scores", {
    examinableName: examinable.name,
    highestSimilarity: maxSimilarity,
    highestMatch: EXAMINABLES[maxIndex].name,
    threshold: SIMILARITY_THRESHOLDS.RELATED_SYMPTOMS,
  });

  const relatedSymptoms = EXAMINABLES.filter(
    (_, i) => similarities[i] > SIMILARITY_THRESHOLDS.RELATED_SYMPTOMS
  ).map((examinable) => SYMPTOMS.find((s) => s.name === examinable.symptom)!);

  logger.debug("Found related symptoms", {
    examinableName: examinable.name,
    relatedSymptomCount: relatedSymptoms.length,
  });
  return relatedSymptoms;
}

async function getCandidateSymptomsFromExam(
  models: Models,
  exam: Exam
): Promise<
  Array<{
    symptoms: Array<SymptomWithEmbedding>;
    examinable: ExaminableWithEmbedding;
  }>
> {
  const examinables = await extractExaminablesFromExam(models, exam);

  const nSymptoms = await Promise.all(
    examinables.map(getRelatedSymptomsFromExaminable)
  );

  return nSymptoms.map(
    (symptoms, i) =>
      ({
        symptoms,
        examinable: examinables[i],
      } satisfies {
        symptoms: Array<SymptomWithEmbedding>;
        examinable: ExaminableWithEmbedding;
      })
  );
}

async function getSymptomExaminableCriterion(
  symptom: SymptomWithEmbedding,
  examinable: ExaminableWithEmbedding
): Promise<CriteriaWithEmbedding> {
  await ready;

  const similarities = EXAMINABLES.filter(
    (e) => e.symptom === symptom.name
  ).map((e) => cosineSimilarity(examinable.embedding, e.embedding));

  let closestExaminable = EXAMINABLES[0];
  let closestSimilarity = similarities[0];
  for (let i = 1; i < similarities.length; i++) {
    if (similarities[i] > closestSimilarity) {
      closestExaminable = EXAMINABLES[i];
      closestSimilarity = similarities[i];
    }
  }

  logger.debug("Found closest examinable match", {
    symptomName: symptom.name,
    examinableName: examinable.name,
    closestMatch: closestExaminable.name,
    similarity: closestSimilarity,
  });

  const criterion = CRITERION.find(
    (c) => c.examinable === closestExaminable.name && c.symptom === symptom.name
  )!;

  return criterion;
}

async function evaluateSymptomExaminableCriterion(
  { model }: Models,
  exam: Exam,
  symptom: Symptom,
  examinable: Examinable,
  criterion: Criteria
): Promise<Evaluation> {
  logger.debug("Evaluating criterion", {
    symptomName: symptom.name,
    examinableName: examinable.name,
  });

  const result = await generateObject({
    model,
    schema: Evaluation,
    messages: [
      {
        role: "system",
        content: PROMPT_EVALUATE_SYMPTOM,
      },
      {
        role: "user",
        content: JSON.stringify({ exam, symptom, examinable, criterion }),
      },
    ],
  });

  logger.debug("Completed criterion evaluation", {
    symptomName: symptom.name,
    examinableName: examinable.name,
    result: result.object.positive,
  });
  return result.object;
}

async function extractSymptomsFromExam(
  models: Models,
  exam: Exam
): Promise<
  Array<{
    symptom: Symptom;
    evaluation: Evaluation;
  }>
> {
  logger.debug("Processing exam for symptoms", {
    examTimestamp: exam.t,
  });

  const symptomsAndExaminable = await getCandidateSymptomsFromExam(
    models,
    exam
  );
  logger.debug("Found candidate symptoms and examinables", {
    candidateCount: symptomsAndExaminable.length,
  });

  const unresolvedTriplets: Array<{
    symptom: SymptomWithEmbedding;
    examinable: ExaminableWithEmbedding;
    criteriaPromise: Promise<CriteriaWithEmbedding>;
  }> = [];
  for (const { symptoms, examinable } of symptomsAndExaminable) {
    for (const symptom of symptoms) {
      unresolvedTriplets.push({
        symptom,
        examinable,
        criteriaPromise: getSymptomExaminableCriterion(symptom, examinable),
      });
    }
  }

  const triplets = await Promise.all(
    unresolvedTriplets.map(
      async ({ symptom, examinable, criteriaPromise }) => ({
        symptom,
        examinable,
        criteria: await criteriaPromise,
      })
    )
  );

  const evaluations = await Promise.all(
    triplets.map(({ symptom, examinable, criteria }, i) =>
      evaluateSymptomExaminableCriterion(
        models,
        exam,
        symptom,
        examinable,
        criteria
      )
    )
  );

  logger.debug("Completed exam symptom extraction", {
    symptomCount: triplets.length,
    positiveEvaluations: evaluations.filter((e) => e.positive).length,
  });
  return triplets.map(({ symptom }, i) => ({
    symptom,
    evaluation: evaluations[i],
  }));
}

async function extractSymptomsFromExams(
  models: Models,
  exams: Array<Exam>
): Promise<Array<Symptom>> {
  const symptomsAndEvaluations = await Promise.all(
    exams.map((e) => extractSymptomsFromExam(models, e))
  );

  return flatten(
    symptomsAndEvaluations.map((x) =>
      x.filter((y) => y.evaluation.positive).map((y) => y.symptom)
    )
  );
}

async function buildGraph(models: Models, snapshots: Array<Snapshot>) {
  logger.info("Building graph from snapshots", {
    snapshotCount: snapshots.length,
  });

  snapshots = snapshots.sort((a, b) => a.t.getTime() - b.t.getTime());

  // Phase 1
  for (const snapshot of snapshots) {
    logger.debug("Processing snapshot", {
      timestamp: snapshot.t,
      descriptionCount: snapshot.descriptions.length,
      examCount: snapshot.exams.length,
    });

    const describedSymptoms = await extractSymptomsFromDescriptions(
      models,
      snapshot.descriptions
    );

    const detectedSymptoms = await extractSymptomsFromExams(
      models,
      snapshot.exams
    );

    const symptoms = [...describedSymptoms, ...detectedSymptoms];

    logger.info("Processed snapshot symptoms", {
      describedSymptomCount: describedSymptoms.length,
      detectedSymptomCount: detectedSymptoms.length,
      totalSymptomCount: symptoms.length,
    });
  }
}

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
        model: gpt4o,
        embeddings: openaiEmbeddings,
      },
      snapshots
    );
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
