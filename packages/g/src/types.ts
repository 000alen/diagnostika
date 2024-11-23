import { z } from "zod";

export const Embeddable = z.object({
  embedding: z.number().array(),
});

export const Exam = z
  .object({
    t: z.date(),
    description: z.string(),
  })
  .describe("TODO");

export type Exam = z.infer<typeof Exam>;

export const Examinable = z
  .object({
    name: z.string(),
    description: z.string(),
  })
  .describe("TODO");

export type Examinable = z.infer<typeof Examinable>;

export const ExaminableWithEmbedding = Examinable.merge(Embeddable);

export type ExaminableWithEmbedding = z.infer<typeof ExaminableWithEmbedding>;

export const Snapshot = z
  .object({
    t: z.date(),
    descriptions: z.array(z.string()),
    exams: z.array(Exam),
  })
  .describe("TODO");

export type Snapshot = z.infer<typeof Snapshot>;

export const Symptom = z
  .object({
    name: z.string().describe("The name of the symptom"),
    description: z
      .string()
      .describe("A detailed and distinctive description of the symptom"),
  })
  .describe("TODO");

export type Symptom = z.infer<typeof Symptom>;

export const SymptomWithEmbedding = Symptom.merge(Embeddable);

export type SymptomWithEmbedding = z.infer<typeof SymptomWithEmbedding>;

export const Criteria = z
  .object({
    name: z.string(),
    criteria: z.string(),
  })
  .describe("TODO");

export type Criteria = z.infer<typeof Criteria>;

export const CriteriaWithEmbedding = Criteria.merge(Embeddable);

export type CriteriaWithEmbedding = z.infer<typeof CriteriaWithEmbedding>;

export const Evaluation = z.object({
  positive: z.boolean(),
  confidence: z.number(),
  explanation: z.string(),
});

export type Evaluation = z.infer<typeof Evaluation>;
