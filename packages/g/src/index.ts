import { generateObject } from "ai";
import { z } from "zod";
import {
  Criteria,
  Evaluation,
  Exam,
  Examinable,
  Snapshot,
  Symptom,
} from "./types";
import { flatten } from "./utils";
import { gpt4o } from "./models";

function sortSnapshots(snapshots: Array<Snapshot>) {
  return snapshots.sort((a, b) => a.t.getTime() - b.t.getTime());
}

async function extractSymptomsFromDescription(
  description: string
): Promise<Array<Symptom>> {
  const result = await generateObject({
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

  return result.object.symptoms;
}

async function extractSymptomsFromDescriptions(descriptions: string[]) {
  const nSymptoms = await Promise.all(
    descriptions.map(extractSymptomsFromDescription)
  );

  return flatten(nSymptoms);
}

async function extractExaminablesFromExam(
  exam: Exam
): Promise<Array<Examinable>> {
  const result = await generateObject({
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

  return result.object.examinables;
}

async function getRelatedSymptomsFromExaminable(
  examinable: Examinable
): Promise<Array<Symptom>> {
  throw new Error("Not implemented");
}

async function getCandidateSymptomsFromExam(
  exam: Exam
): Promise<Array<Symptom>> {
  const examinables = await extractExaminablesFromExam(exam);

  const relatedSymptoms = await Promise.all(
    examinables.map(getRelatedSymptomsFromExaminable)
  );

  const flattenedSymptoms = flatten(relatedSymptoms);

  // Deduplicate symptoms by name
  return Array.from(
    new Map(
      flattenedSymptoms.map((symptom) => [symptom.name, symptom])
    ).values()
  );
}

async function getSymptomCriterion(symptom: Symptom): Promise<Criteria> {
  throw new Error("Not implemented");
}

async function evaluateSymptomCriterion(
  exam: Exam,
  symptom: Symptom,
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
        content: JSON.stringify({ exam, symptom, criterion }),
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
  const candidateSymptoms = await getCandidateSymptomsFromExam(exam);

  const criterion = await Promise.all(
    candidateSymptoms.map(getSymptomCriterion)
  );

  const evaluations = await Promise.all(
    candidateSymptoms.map((symptom, i) =>
      evaluateSymptomCriterion(exam, symptom, criterion[i])
    )
  );

  return candidateSymptoms.map((symptom, i) => ({
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
  snapshots = sortSnapshots(snapshots);

  // Phase 1
  for (const snapshot of snapshots) {
    const describedSymptoms = await extractSymptomsFromDescriptions(
      snapshot.descriptions
    );

    const detectedSymptoms = await extractSymptomsFromExams(snapshot.exams);
  }
}

async function main() {
  const snapshots: Array<Snapshot> = [];

  const graph = await buildGraph(snapshots);

  console.log(graph);
}

main().catch(console.error);
