import { uuid } from "drizzle-orm/pg-core";
import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  vector,
  index,
  primaryKey,
  jsonb,
} from "drizzle-orm/pg-core";

export const diseases = pgTable(
  "diseases",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    embedding: vector("embedding", { dimensions: 1024 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    embeddingIdx: index("diseases_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);

export const symptoms = pgTable(
  "symptoms",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    embedding: vector("embedding", { dimensions: 1024 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    embeddingIdx: index("symptoms_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);

export const examinables = pgTable(
  "examinables",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    embedding: vector("embedding", { dimensions: 1024 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    embeddingIdx: index("examinables_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);

export const criteria = pgTable(
  "criteria",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    embedding: vector("embedding", { dimensions: 1024 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    embeddingIdx: index("criteria_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);

export const diseaseSymptoms = pgTable(
  "disease_symptoms",
  {
    diseaseId: integer("disease_id")
      .references(() => diseases.id, { onDelete: "cascade" })
      .notNull(),
    symptomId: integer("symptom_id")
      .references(() => symptoms.id, { onDelete: "cascade" })
      .notNull(),
    severity: integer("severity"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.diseaseId, table.symptomId] }),
  })
);

export const symptomExaminables = pgTable(
  "symptom_examinables",
  {
    symptomId: integer("symptom_id")
      .references(() => symptoms.id, { onDelete: "cascade" })
      .notNull(),
    examinableId: integer("examinable_id")
      .references(() => examinables.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.symptomId, table.examinableId] }),
  })
);

export const examinableCriteria = pgTable(
  "examinable_criteria",
  {
    examinableId: integer("examinable_id")
      .references(() => examinables.id, { onDelete: "cascade" })
      .notNull(),
    criteriaId: integer("criteria_id")
      .references(() => criteria.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.examinableId, table.criteriaId] }),
  })
);

export const snapshots = pgTable("snapshots", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .references(() => patients.id)
    .notNull(),
  t: timestamp("t").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const snapshotDescriptions = pgTable("snapshot_descriptions", {
  id: serial("id").primaryKey(),
  snapshotId: integer("snapshot_id")
    .references(() => snapshots.id, { onDelete: "cascade" })
    .notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .references(() => patients.id)
    .notNull(),
  t: timestamp("t").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const snapshotExams = pgTable(
  "snapshot_exams",
  {
    snapshotId: integer("snapshot_id")
      .references(() => snapshots.id, { onDelete: "cascade" })
      .notNull(),
    examId: integer("exam_id")
      .references(() => exams.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.snapshotId, table.examId] }),
  })
);

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rut: text("rut").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const graphs = pgTable("graphs", {
  id: uuid("id").primaryKey().defaultRandom(),
  snapshotId: integer("snapshot_id")
    .references(() => snapshots.id, { onDelete: "cascade" })
    .notNull(),
  graph: jsonb("graph").notNull(),
  symptoms: jsonb("symptoms").notNull(),
  diagnosis: jsonb("diagnosis"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const queue = pgTable("queue", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .references(() => patients.id, { onDelete: "cascade" })
    .notNull(),
  t: timestamp("t").notNull(),
  priority: integer("priority").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
