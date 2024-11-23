import "dotenv/config";

import { Criteria, Examinable, SymptomWithEmbedding } from "../src/types";
import { logger } from "../src/logging";
import { cohereEmbeddings } from "../src/models";
import { embed } from "ai";
import {
  db,
  symptoms,
  examinables,
  criteria,
  symptomExaminables,
  examinableCriteria,
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

  const SYMPTOMS: SymptomWithId[] = await Promise.all(
    [
      {
        name: _RUNNY_NOSE,
        description: "Nasal discharge",
      },
    ].map(async (symptom) => {
      const { embedding } = await embed({
        model: cohereEmbeddings,
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
        model: cohereEmbeddings,
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
        model: cohereEmbeddings,
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
    console.error(error)
  }
}

main().catch(console.error);
