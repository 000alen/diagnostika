import { embed } from "ai";
import { Criteria, Examinable, Symptom } from "./types";

const _RUNNY_NOSE = "Runny nose";

export const SYMPTOMS: Array<Symptom> = [
  {
    name: _RUNNY_NOSE,
    description: "Nasal discharge",
  },
];

export const EXAMINABLES: Record<string, Array<Examinable>> = {
  [_RUNNY_NOSE]: [
    {
      name: "Mucous",
      description: "The substance that is discharged from the nose",
    },
  ],
};

export const CRITERION: Record<string, Array<Criteria>> = {
  [_RUNNY_NOSE]: [
    {
      name: "Lots of mucous",
      criteria: "The amount of mucous is significant",
    },
  ],
};
