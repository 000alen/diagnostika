import "dotenv/config";
import { readFile } from "fs/promises";

import { Criteria, Examinable, SymptomWithEmbedding } from "../src/types";
import { logger } from "../src/logging";
import { titanEmbeddings } from "../src/models";
import { embed } from "ai";
import {
  db,
  symptoms,
  examinables,
  criteria,
  symptomExaminables,
  examinableCriteria,
  diseases,
  diseaseSymptoms,
} from "@bananus/db";

type SymptomWithId = {
  name: string;
  description: string;
  embedding: number[];
  id: number;
};

const _RUNNY_NOSE = "Runny nose";

async function seedData() {
  // First clear existing data
  await db.delete(examinableCriteria);
  await db.delete(symptomExaminables);
  await db.delete(criteria);
  await db.delete(examinables);
  await db.delete(symptoms);
  await db.delete(diseases);
  await db.delete(diseaseSymptoms);

  // Load parsed data from JSON file
  const parsedData = JSON.parse(
    await readFile("./scripts/parsed.json", "utf-8")
  ) as {
    name: string;
    description: string;
    symptoms: {
      name: string;
      description;
    }[];
  }[];

  logger.info("Seeding diseases...");

  // Insert diseases and their symptoms into the database
  const insertedDiseases = await Promise.all(
    parsedData.map(async (disease) => {
      const { name, description } = disease;

      const { embedding: diseaseEmbedding } = await embed({
        model: titanEmbeddings,
        value: `${name}: ${description}`,
      });

      const [insertedDisease] = await db
        .insert(diseases)
        .values({
          name,
          description,
          embedding: diseaseEmbedding, // Assuming you want to set this later
        })
        .returning();

      return insertedDisease;
    })
  );

  // Insert symptoms and create relationships
  const insertedDiseaseAndSymptoms = await Promise.all(
    parsedData
      .flatMap((f, i) =>
        f.symptoms.map((s) => ({
          symptom: s,
          insertedDisease: insertedDiseases[i],
        }))
      )
      .map(async ({ symptom, insertedDisease }) => {
        const { name: symptomName, description: symptomDescription } = symptom;

        const { embedding: symptomEmbedding } = await embed({
          model: titanEmbeddings,
          value: `${symptomName}: ${symptomDescription}`,
        });

        const [insertedSymptom] = await db
          .insert(symptoms)
          .values({
            name: symptomName,
            description: symptomDescription,
            embedding: symptomEmbedding, // Assuming you want to set this later
          })
          .returning();

        return {
          insertedSymptom,
          insertedDisease,
        };
      })
  );

  // Create relationships between diseases and symptoms
  await Promise.all(
    insertedDiseaseAndSymptoms.map(
      async ({ insertedSymptom, insertedDisease }) => {
        await db.insert(diseaseSymptoms).values({
          diseaseId: insertedDisease.id,
          symptomId: insertedSymptom.id,
        });
      }
    )
  );

  const SYMPTOMS: SymptomWithId[] = await Promise.all(
    [
      {
        name: _RUNNY_NOSE,
        description: "Nasal discharge",
      },
    ].map(async (symptom) => {
      const { embedding } = await embed({
        model: titanEmbeddings,
        value: `${symptom.name}: ${symptom.description}`,
      });

      const [insertedSymptom] = await db
        .insert(symptoms)
        .values({
          name: symptom.name,
          description: symptom.description,
          embedding,
        })
        .returning();

      return {
        ...symptom,
        embedding,
        id: insertedSymptom.id,
      };
    })
  );

  const EXAMINABLES = await Promise.all(
    SYMPTOMS.map(async (symptom) => {
      const examinable: Examinable = {
        name: "Mucous",
        description: "The substance that is discharged from the nose",
      };

      const { embedding } = await embed({
        model: titanEmbeddings,
        value: `${examinable.name}: ${examinable.description}`,
      });

      // Insert examinable
      const [insertedExaminable] = await db
        .insert(examinables)
        .values({
          name: examinable.name,
          description: examinable.description,
          embedding,
        })
        .returning();

      // Create relationship between symptom and examinable
      await db.insert(symptomExaminables).values({
        symptomId: symptom.id,
        examinableId: insertedExaminable.id,
      });

      return {
        ...examinable,
        id: insertedExaminable.id,
        symptom: symptom.name,
        embedding,
      };
    })
  );

  await Promise.all(
    SYMPTOMS.map(async (symptom, i) => {
      const criteriaData: Criteria = {
        name: "Lots of mucous",
        criteria: "The amount of mucous is significant",
      };

      const examinable = EXAMINABLES[i];

      const { embedding } = await embed({
        model: titanEmbeddings,
        value: `${criteriaData.name}: ${criteriaData.criteria}`,
      });

      // Insert criteria
      const [insertedCriteria] = await db
        .insert(criteria)
        .values({
          name: criteriaData.name,
          description: criteriaData.criteria,
          embedding,
        })
        .returning();

      // Create relationship between examinable and criteria
      await db.insert(examinableCriteria).values({
        examinableId: examinable.id,
        criteriaId: insertedCriteria.id,
      });

      return {
        ...criteriaData,
        id: insertedCriteria.id,
        symptom: symptom.name,
        examinable: examinable.name,
        embedding,
      };
    })
  );
}

async function main() {
  try {
    await db.transaction(async (tx) => {
      await seedData();
      logger.info("Seeding completed successfully");
    });
  } catch (error) {
    // logger.error("Error during seeding:", error);
    // throw error;
    console.error(error);
  }
}

main().catch(console.error);
