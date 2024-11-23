import { z } from "zod";

export const Embeddable = z.object({
  embedding: z
    .number()
    .array()
    .describe(
      "A high-dimensional vector in a latent space representing the meaning of the object"
    ),
});

export const Exam = z
  .object({
    t: z.date().describe("The date and time the exam was taken"),
    description: z.string().describe("A detailed description of the exam"),
  })
  .describe("An exam taken by a patient");

export type Exam = z.infer<typeof Exam>;

export const Examinable = z
  .object({
    name: z.string().describe("The name of the examinable"),
    description: z
      .string()
      .describe("A detailed description of the examinable"),
  })
  .describe("A metric or observation that can be measured or observed");

export type Examinable = z.infer<typeof Examinable>;

export const ExaminableWithEmbedding = Examinable.merge(Embeddable);

export type ExaminableWithEmbedding = z.infer<typeof ExaminableWithEmbedding>;

export const Snapshot = z
  .object({
    t: z.date().describe("The date and time the snapshot was taken"),
    descriptions: z.string().array().describe("A list of descriptions"),
    exams: Exam.array().describe("A list of exams"),
  })
  .describe("A snapshot of a patient's health");

export type Snapshot = z.infer<typeof Snapshot>;

export const Symptom = z
  .object({
    name: z.string().describe("The name of the symptom"),
    description: z
      .string()
      .describe("A detailed and distinctive description of the symptom"),
  })
  .describe("A symptom experienced by a patient");

export type Symptom = z.infer<typeof Symptom>;

export const SymptomWithEmbedding = Symptom.merge(Embeddable);

export type SymptomWithEmbedding = z.infer<typeof SymptomWithEmbedding>;

export const Criteria = z
  .object({
    name: z.string().describe("The name of the criteria to evaluate against"),
    criteria: z
      .string()
      .describe("The criteria to evaluate a symptom's examinables against"),
  })
  .describe("A criteria to evaluate a symptom's examinables against");

export type Criteria = z.infer<typeof Criteria>;

export const CriteriaWithEmbedding = Criteria.merge(Embeddable);

export type CriteriaWithEmbedding = z.infer<typeof CriteriaWithEmbedding>;

export const Evaluation = z.object({
  explanation: z.string().describe("An explanation of the evaluation"),
  confidence: z
    .number()
    .describe("The confidence (from 0 to 1) of the evaluation"),
  positive: z
    .boolean()
    .describe("Whether the evaluation is positive, i.e., the criteria is met"),
});

export type Evaluation = z.infer<typeof Evaluation>;
