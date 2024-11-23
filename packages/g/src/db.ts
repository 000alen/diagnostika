import { embed } from "ai";
import { Criteria, Examinable, SymptomWithEmbedding } from "./types";
import { titanEmbeddings } from "./models";

const _RUNNY_NOSE = "Runny nose";

async function seed() {
  const SYMPTOMS: Array<SymptomWithEmbedding> = await Promise.all(
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

      return {
        ...symptom,
        embedding,
      };
    })
  );

  const EXAMINABLES: Array<{
    name: string;
    description: string;
    symptom: string;
    embedding: Array<number>;
  }> = await Promise.all(
    SYMPTOMS.map(async (symptom) => {
      const examinable: Examinable = {
        name: "Mucous",
        description: "The substance that is discharged from the nose",
      };

      const { embedding } = await embed({
        model: titanEmbeddings,
        value: `${examinable.name}: ${examinable.description}`,
      });

      return {
        ...examinable,
        symptom: symptom.name,
        embedding,
      };
    })
  );

  const CRITERION = await Promise.all(
    SYMPTOMS.map(async (symptom, i) => {
      const criteria: Criteria = {
        name: "Lots of mucous",
        criteria: "The amount of mucous is significant",
      };

      const examinable = EXAMINABLES[i];

      const { embedding } = await embed({
        model: titanEmbeddings,
        value: `${criteria.name}: ${criteria.criteria}`,
      });

      return {
        ...criteria,
        symptom: symptom.name,
        examinable: examinable.name,
        embedding,
      };
    })
  );

  return { SYMPTOMS, EXAMINABLES, CRITERION };
}

export let SYMPTOMS: Array<SymptomWithEmbedding>;
export let EXAMINABLES: Array<{
  name: string;
  description: string;
  symptom: string;
  embedding: Array<number>;
}>;
export let CRITERION: Array<{
  name: string;
  criteria: string;
  symptom: string;
  examinable: string;
  embedding: Array<number>;
}>;

export const ready = seed().then((data) => {
  SYMPTOMS = data.SYMPTOMS;
  EXAMINABLES = data.EXAMINABLES;
  CRITERION = data.CRITERION;
});
