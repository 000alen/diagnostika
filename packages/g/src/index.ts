import "dotenv/config";

import { embed, generateObject, cosineSimilarity } from "ai";
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
import { gpt4o, openaiEmbeddings } from "./models";
import { CRITERION, EXAMINABLES, ready, SYMPTOMS } from "./db";

async function extractSymptomsFromDescription(
  description: string
): Promise<Array<SymptomWithEmbedding>> {
  const { object } = await generateObject({
    model: gpt4o,
    schema: z.object({
      symptoms: Symptom.array(),
    }),
    messages: [
      {
        role: "system",
        content:
          "You are an expert in the field of medicine. Your task is to extract and infer symptoms from the given description.",
      },
      {
        role: "user",
        content: description,
      },
    ],
  });

  const withEmbeddings = await Promise.all(
    object.symptoms.map(async (symptom) => {
      const { embedding } = await embed({
        model: openaiEmbeddings,
        value: `${symptom.name}: ${symptom.description}`,
      });

      return {
        ...symptom,
        embedding,
      };
    })
  );

  return withEmbeddings;
}

async function extractSymptomsFromDescriptions(descriptions: string[]) {
  const nSymptoms = await Promise.all(
    descriptions.map(extractSymptomsFromDescription)
  );

  return flatten(nSymptoms);
}

async function extractExaminablesFromExam(
  exam: Exam
): Promise<Array<ExaminableWithEmbedding>> {
  const { object } = await generateObject({
    model: gpt4o,
    schema: z.object({
      examinables: Examinable.array(),
    }),
    messages: [
      {
        role: "system",
        content:
          "You are an expert in the field of medicine. Your task is to extract and infer examinables from the given exam.",
      },
      {
        role: "user",
        content: exam.description,
      },
    ],
  });

  const withEmbeddings = await Promise.all(
    object.examinables.map(async (examinable) => {
      const { embedding } = await embed({
        model: openaiEmbeddings,
        value: `${examinable.name}: ${examinable.description}`,
      });

      return {
        ...examinable,
        embedding,
      };
    })
  );

  return withEmbeddings;
}

async function getRelatedSymptomsFromExaminable(
  examinable: ExaminableWithEmbedding
): Promise<Array<SymptomWithEmbedding>> {
  await ready;

  const THRESHOLD = 0.8;

  const similarities = EXAMINABLES.map((e) =>
    cosineSimilarity(examinable.embedding, e.embedding)
  );

  const relatedSymptoms = EXAMINABLES.filter(
    (_, i) => similarities[i] > THRESHOLD
  ).map((examinable) => SYMPTOMS.find((s) => s.name === examinable.symptom)!);

  return relatedSymptoms;
}

async function getCandidateSymptomsFromExam(exam: Exam): Promise<
  Array<{
    symptoms: Array<SymptomWithEmbedding>;
    examinable: ExaminableWithEmbedding;
  }>
> {
  const examinables = await extractExaminablesFromExam(exam);

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

  const criterion = CRITERION.find(
    (c) => c.examinable === closestExaminable.name && c.symptom === symptom.name
  )!;

  return criterion;
}

async function evaluateSymptomExaminableCriterion(
  exam: Exam,
  symptom: Symptom,
  examinable: Examinable,
  criterion: Criteria
): Promise<Evaluation> {
  const result = await generateObject({
    model: gpt4o,
    schema: Evaluation,
    messages: [
      {
        role: "system",
        content:
          "You are an expert in the field of medicine. Your task is to evaluate the given symptom criterion based on the given exam.",
      },
      {
        role: "user",
        content: JSON.stringify({ exam, symptom, examinable, criterion }),
      },
    ],
  });

  return result.object;
}

async function extractSymptomsFromExam(exam: Exam): Promise<
  Array<{
    symptom: Symptom;
    evaluation: Evaluation;
  }>
> {
  const symptomsAndExaminable = await getCandidateSymptomsFromExam(exam);

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
      evaluateSymptomExaminableCriterion(exam, symptom, examinable, criteria)
    )
  );

  return triplets.map(({ symptom }, i) => ({
    symptom,
    evaluation: evaluations[i],
  }));
}

async function extractSymptomsFromExams(
  exams: Array<Exam>
): Promise<Array<Symptom>> {
  const symptomsAndEvaluations = await Promise.all(
    exams.map(extractSymptomsFromExam)
  );

  return flatten(
    symptomsAndEvaluations.map((x) =>
      x.filter((y) => y.evaluation.positive).map((y) => y.symptom)
    )
  );
}

async function buildGraph(snapshots: Array<Snapshot>) {
  snapshots = snapshots.sort((a, b) => a.t.getTime() - b.t.getTime());

  // Phase 1
  for (const snapshot of snapshots) {
    const describedSymptoms = await extractSymptomsFromDescriptions(
      snapshot.descriptions
    );

    const detectedSymptoms = await extractSymptomsFromExams(snapshot.exams);

    const symptoms = [...describedSymptoms, ...detectedSymptoms];

    console.log(symptoms);
  }
}

async function main() {
  const snapshots: Array<Snapshot> = [
    {
      t: new Date(),
      descriptions: [],
      exams: [
        {
          t: new Date(),
          description: "the patient has a high level of mucous",
        },
      ],
    },
  ];

  const graph = await buildGraph(snapshots);

  console.log(graph);
}

main().catch(console.error);
