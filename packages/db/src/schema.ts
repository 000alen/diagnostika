import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  vector,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Base tables
export const diseases = pgTable(
  "diseases",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    embedding: vector("embedding", { dimensions: 1536 }),
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
    name: text("name").notNull().unique(),
    description: text("description"),
    embedding: vector("embedding", { dimensions: 1536 }),
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
    name: text("name").notNull().unique(),
    description: text("description"),
    embedding: vector("embedding", { dimensions: 1536 }),
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
    name: text("name").notNull().unique(),
    description: text("description"),
    embedding: vector("embedding", { dimensions: 1536 }),
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

// Linking tables
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

// Relations
export const diseasesRelations = relations(diseases, ({ many }) => ({
  diseaseSymptoms: many(diseaseSymptoms),
}));

export const symptomsRelations = relations(symptoms, ({ many }) => ({
  diseaseSymptoms: many(diseaseSymptoms),
  symptomExaminables: many(symptomExaminables),
}));

export const examinablesRelations = relations(examinables, ({ many }) => ({
  symptomExaminables: many(symptomExaminables),
  examinableCriteria: many(examinableCriteria),
}));

export const criteriaRelations = relations(criteria, ({ many }) => ({
  examinableCriteria: many(examinableCriteria),
}));

// Linking table relations
export const diseaseSymptomsRelations = relations(
  diseaseSymptoms,
  ({ one }) => ({
    disease: one(diseases, {
      fields: [diseaseSymptoms.diseaseId],
      references: [diseases.id],
    }),
    symptom: one(symptoms, {
      fields: [diseaseSymptoms.symptomId],
      references: [symptoms.id],
    }),
  })
);

export const symptomExaminablesRelations = relations(
  symptomExaminables,
  ({ one }) => ({
    symptom: one(symptoms, {
      fields: [symptomExaminables.symptomId],
      references: [symptoms.id],
    }),
    examinable: one(examinables, {
      fields: [symptomExaminables.examinableId],
      references: [examinables.id],
    }),
  })
);

export const examinableCriteriaRelations = relations(
  examinableCriteria,
  ({ one }) => ({
    examinable: one(examinables, {
      fields: [examinableCriteria.examinableId],
      references: [examinables.id],
    }),
    criteria: one(criteria, {
      fields: [examinableCriteria.criteriaId],
      references: [criteria.id],
    }),
  })
);
