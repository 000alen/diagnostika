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
import { flatten, product } from "./utils";
import {
  PROMPT_EVALUATE_SYMPTOM,
  PROMPT_EXTRACT_EXAMINABLES,
  PROMPT_EXTRACT_SYMPTOMS,
} from "./prompts";
import {
  db,
  symptoms,
  examinables,
  criteria,
  symptomExaminables,
  examinableCriteria,
  cosineDistance,
  desc,
  gt,
  sql,
  eq,
} from "@bananus/db";

export * from "./models";
export * from "./utils";
export * from "./types";

interface Models {
  model: LanguageModel;
  embeddings: EmbeddingModel<string>;
}

// Add threshold constants
const SIMILARITY_THRESHOLDS = {
  RELATED_SYMPTOMS: 0.5, // Used in getRelatedSymptomsFromExaminable
} as const;

export async function extractSymptomsFromDescription(
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

export async function extractSymptomsFromDescriptions(
  models: Models,
  descriptions: string[]
) {
  const nSymptoms = await Promise.all(
    descriptions.map((d) => extractSymptomsFromDescription(models, d))
  );

  return flatten(nSymptoms);
}

export async function extractExaminablesFromExam(
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

export async function getRelatedSymptomsFromExaminable(
  examinable: ExaminableWithEmbedding
): Promise<Array<SymptomWithEmbedding>> {
  logger.debug("Finding related symptoms for examinable", {
    examinableName: examinable.name,
  });

  // Calculate similarity with all examinables in the database
  const similarity = sql<number>`1 - (${cosineDistance(
    examinables.embedding,
    examinable.embedding
  )})`;

  const relatedSymptoms = await db
    .select({
      symptom: symptoms,
    })
    .from(symptoms)
    .innerJoin(
      symptomExaminables,
      eq(symptomExaminables.symptomId, symptoms.id)
    )
    .innerJoin(examinables, eq(examinables.id, symptomExaminables.examinableId))
    .where(gt(similarity, SIMILARITY_THRESHOLDS.RELATED_SYMPTOMS))
    .orderBy(desc(similarity));

  logger.debug("Found related symptoms", {
    examinableName: examinable.name,
    relatedSymptomCount: relatedSymptoms.length,
  });

  return relatedSymptoms.map((r) => ({
    ...r.symptom,
    embedding: r.symptom.embedding as number[],
  }));
}

export async function getCandidateSymptomsFromExam(
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

export async function getSymptomExaminableCriterion(
  symptom: SymptomWithEmbedding,
  examinable: ExaminableWithEmbedding
): Promise<CriteriaWithEmbedding> {
  // Find similar examinables that are linked to this symptom
  const similarity = sql<number>`1 - (${cosineDistance(
    examinables.embedding,
    examinable.embedding
  )})`;

  const similarExaminable = await db
    .select({
      examinable: examinables,
      similarity,
    })
    .from(examinables)
    .innerJoin(
      symptomExaminables,
      eq(symptomExaminables.examinableId, examinables.id)
    )
    .innerJoin(symptoms, eq(symptoms.id, symptomExaminables.symptomId))
    .where(eq(symptoms.name, symptom.name))
    .orderBy(desc(similarity))
    .limit(1)
    .then((results) => results[0]);

  if (!similarExaminable) {
    throw new Error(`No matching examinable found for symptom ${symptom.name}`);
  }

  // Get the criterion for this examinable-symptom pair
  const criterion = await db
    .select({
      criterion: criteria,
    })
    .from(criteria)
    .innerJoin(
      examinableCriteria,
      eq(examinableCriteria.criteriaId, criteria.id)
    )
    .where(eq(examinableCriteria.examinableId, similarExaminable.examinable.id))
    .then((results) => results[0]);

  if (!criterion) {
    throw new Error(
      `No criterion found for examinable ${similarExaminable.examinable.name}`
    );
  }

  return {
    ...criterion.criterion,
    criteria: criterion.criterion.description,
    embedding: criterion.criterion.embedding as number[],
    // symptom: symptom.name,
    // examinable: similarExaminable.examinable.name,
  };
}

export async function evaluateSymptomExaminableCriterion(
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

export async function extractSymptomsFromExam(
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

export async function extractSymptomsFromExams(
  models: Models,
  exams: Array<Exam>
): Promise<
  Array<{
    symptom: Symptom;
    evaluation: Evaluation;
  }>
> {
  const symptomsAndEvaluations = await Promise.all(
    exams.map((e) => extractSymptomsFromExam(models, e))
  );

  return flatten(
    symptomsAndEvaluations.map((x) =>
      x
        .filter((y) => y.evaluation.positive)
        .map((y) => ({ symptom: y.symptom, evaluation: y.evaluation }))
    )
  );
}

export async function buildGraph(models: Models, snapshots: Array<Snapshot>) {
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

    const symptoms = [
      ...describedSymptoms,
      ...detectedSymptoms.map((x) => x.symptom),
    ];

    logger.info("Processed snapshot symptoms", {
      describedSymptomCount: describedSymptoms.length,
      detectedSymptomCount: detectedSymptoms.length,
      totalSymptomCount: symptoms.length,
    });
  }
}

export function* rankCandidates(
  symptoms: Array<SymptomWithEmbedding>,
  target: SymptomWithEmbedding
) {
  const similarities = symptoms.map((s) =>
    cosineSimilarity(target.embedding, s.embedding)
  );

  const ranked = symptoms
    .map((s, i) => ({ symptom: s, similarity: similarities[i] }))
    .sort((a, b) => b.similarity - a.similarity);

  yield* ranked;
}

export function* getCandidates(
  symptoms: Array<SymptomWithEmbedding>,
  query: Array<SymptomWithEmbedding>
) {
  const candidateGenerators = query.map((q) => rankCandidates(symptoms, q));

  yield* product(...candidateGenerators);
}

export function match(
  symptoms: Array<SymptomWithEmbedding>,
  query: Array<SymptomWithEmbedding>,
  threshold: number
) {
  for (const candidate of getCandidates(symptoms, query)) {
    const meanSimilarity =
      candidate.reduce((acc, { similarity }) => acc + similarity, 0) /
      candidate.length;

    if (meanSimilarity >= threshold)
      return candidate.map(({ symptom }) => symptom);
  }
}

export async function refine(
  symptoms: Array<SymptomWithEmbedding>
): Promise<Array<SymptomWithEmbedding>> {
  // TODO
  return symptoms;
}

export async function search(
  symptoms: Array<SymptomWithEmbedding>,
  query: Array<SymptomWithEmbedding>,
  maxIterations: number,
  threshold: number
) {
  let i = 0;

  while (i < maxIterations) {
    const result = match(symptoms, query, threshold);
    if (result) return result;

    symptoms = await refine(symptoms);
    i++;
  }
}
