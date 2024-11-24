import "dotenv/config";
import { logger } from "@bananus/logging";

import { embed, generateObject, cosineSimilarity } from "ai";
import { z } from "zod";
import {
  Criteria,
  CriteriaWithEmbedding,
  Evaluation,
  EvaluationWithEmbedding,
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
import { Graph } from "./graph";
import { Models } from "./models";

export * from "./models";
export * from "./utils";
export * from "./types";

// Add threshold constants
const SIMILARITY_THRESHOLDS = {
  RELATED_SYMPTOMS: 0.5, // Used in getRelatedSymptomsFromExaminable
} as const;

export async function extractSymptomsFromDescription(
  models: Models,
  description: string
): Promise<Array<SymptomWithEmbedding>> {
  logger.debug("Extracting symptoms from description", { description });

  const { object } = await generateObject({
    model: models.language,
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
        model: models.embedding,
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
  graph: Graph,
  descriptions: string[]
) {
  const nSymptoms = await Promise.all(
    descriptions.map((d) => extractSymptomsFromDescription(models, d))
  );

  const symptoms = flatten(nSymptoms);

  for (const symptom of symptoms)
    graph.addNode({
      id: symptom.name,
      type: "Symptom",
      embedding: symptom.embedding,
      symptom,
    });

  return symptoms;
}

export async function extractExaminablesFromExam(
  models: Models,
  graph: Graph,
  exam: Exam
): Promise<Array<ExaminableWithEmbedding>> {
  logger.debug("Extracting examinables from exam", { exam });

  const { object } = await generateObject({
    model: models.language,
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
        model: models.embedding,
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
  graph: Graph,
  exam: Exam
): Promise<
  Array<{
    symptoms: Array<SymptomWithEmbedding>;
    examinable: ExaminableWithEmbedding;
  }>
> {
  const examinables = await extractExaminablesFromExam(models, graph, exam);

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
  models: Models,
  exam: Exam,
  symptom: Symptom,
  examinable: Examinable,
  criterion: Criteria
): Promise<EvaluationWithEmbedding> {
  logger.debug("Evaluating criterion", {
    symptomName: symptom.name,
    examinableName: examinable.name,
  });

  const result = await generateObject({
    model: models.language,
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

  const withEmbedding: EvaluationWithEmbedding = {
    ...result.object,
    embedding: await embed({
      model: models.embedding,
      value: `${symptom.name} (${
        result.object.positive ? "positive" : "negative"
      }, with confidence ${result.object.confidence}): ${examinable.name}: ${
        criterion.name
      }: ${result.object.explanation}`,
    }).then(({ embedding }) => embedding),
  };

  return withEmbedding;
}

export async function extractSymptomsFromExam(
  models: Models,
  graph: Graph,
  exam: Exam
): Promise<
  Array<{
    symptom: SymptomWithEmbedding;
    evaluation: EvaluationWithEmbedding;
  }>
> {
  logger.debug("Processing exam for symptoms", {
    examTimestamp: exam.t,
  });

  const symptomsAndExaminable = await getCandidateSymptomsFromExam(
    models,
    graph,
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
  graph: Graph,
  exams: Array<Exam>
): Promise<
  Array<{
    exam: Exam;
    symptom: Symptom;
    evaluation: Evaluation;
  }>
> {
  const examEmbeddings = await Promise.all(
    exams.map((exam) =>
      embed({
        model: models.embedding,
        value: `${exam.name}: ${exam.description}`,
      }).then(({ embedding }) => embedding)
    )
  );

  const nSymptomsAndEvaluations = await Promise.all(
    exams.map((exam) => extractSymptomsFromExam(models, graph, exam))
  );

  const triplets = flatten(
    nSymptomsAndEvaluations.map((nSymptomAndEvaluation, i) =>
      nSymptomAndEvaluation
        .filter(({ evaluation }) => evaluation.positive)
        .map(({ symptom, evaluation }) => ({
          exam: exams[i],
          symptom,
          evaluation,
        }))
    )
  );

  for (let i = 0; i < triplets.length; i++) {
    const { exam, symptom, evaluation } = triplets[i];

    graph.addNode({
      id: exam.name,
      type: "Exam",
      embedding: examEmbeddings[i],
      exam,
    });

    graph.addNode({
      id: symptom.name,
      type: "Symptom",
      embedding: symptom.embedding,
      symptom,
    });

    graph.addEdge({
      id: `${exam.name}-${symptom.name}`,
      type: "Evaluation",

      source: exam.name,
      sourceEmbedding: examEmbeddings[i],

      target: symptom.name,
      targetEmbedding: symptom.embedding,

      embedding: evaluation.embedding,
      evaluation,
    });
  }

  return triplets;
}

export async function buildGraph(models: Models, snapshots: Array<Snapshot>) {
  logger.info("Building graph from snapshots", {
    snapshotCount: snapshots.length,
  });

  snapshots = snapshots.sort((a, b) => a.t.getTime() - b.t.getTime());

  const graph = new Graph();
  const symptoms = [];

  // Phase 1
  for (const snapshot of snapshots) {
    logger.debug("Processing snapshot", {
      timestamp: snapshot.t,
      descriptionCount: snapshot.descriptions.length,
      examCount: snapshot.exams.length,
    });

    const describedSymptoms = await extractSymptomsFromDescriptions(
      models,
      graph,
      snapshot.descriptions
    );

    const detectedSymptoms = await extractSymptomsFromExams(
      models,
      graph,
      snapshot.exams
    );

    // const symptoms = [
    //   ...describedSymptoms,
    //   ...detectedSymptoms.map((x) => x.symptom),
    // ];

    symptoms.push(
      ...describedSymptoms,
      ...detectedSymptoms.map((x) => x.symptom)
    );

    logger.info("Processed snapshot symptoms", {
      describedSymptomCount: describedSymptoms.length,
      detectedSymptomCount: detectedSymptoms.length,
      totalSymptomCount: symptoms.length,
    });
  }

  return {
    graph,
    symptoms,
  };
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
