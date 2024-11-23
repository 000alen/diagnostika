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

export const NodeType = z.enum(["Symptom", "Exam"]);

export type NodeType = z.infer<typeof NodeType>;

export const EdgeType = z.enum(["Evaluation", "Related"]);

export type EdgeType = z.infer<typeof EdgeType>;

export const BaseNode = z.object({
  id: z.string().describe("The unique identifier of the node"),
  type: NodeType.describe("The type of the node"),
  embedding: z.number().array().describe("The embedding of the node"),
});

export type BaseNode = z.infer<typeof BaseNode>;

export const SymptomNode = BaseNode.extend({
  type: z.literal("Symptom"),
  symptom: SymptomWithEmbedding.describe("The symptom"),
});

export type SymptomNode = z.infer<typeof SymptomNode>;

export const ExamNode = BaseNode.extend({
  type: z.literal("Exam"),
  exam: Exam.describe("The exam"),
});

export const Node = z.discriminatedUnion("type", [SymptomNode, ExamNode]);

export type Node = z.infer<typeof Node>;

export const BaseEdge = z.object({
  id: z.string().describe("The unique identifier of the edge"),
  type: EdgeType.describe("The type of the edge"),

  source: z.string().describe("The unique identifier of the source node"),
  sourceEmbedding: z
    .number()
    .array()
    .describe("The embedding of the source node"),

  target: z.string().describe("The unique identifier of the target node"),
  targetEmbedding: z
    .number()
    .array()
    .describe("The embedding of the target node"),

  embedding: z.number().array().describe("The embedding of the edge"),
});

export type BaseEdge = z.infer<typeof BaseEdge>;

export const EvaluationEdge = BaseEdge.extend({
  type: z.literal("Evaluation"),
  evaluation: Evaluation.describe("The evaluation"),
});

export type EvaluationEdge = z.infer<typeof EvaluationEdge>;

export const RelatedEdge = BaseEdge.extend({
  type: z.literal("Related"),
  weight: z.number().describe("The weight of the relatedness"),
});

export type RelatedEdge = z.infer<typeof RelatedEdge>;

export const Edge = z.discriminatedUnion("type", [EvaluationEdge, RelatedEdge]);

export type Edge = z.infer<typeof Edge>;
