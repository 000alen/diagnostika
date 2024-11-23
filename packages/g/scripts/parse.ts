import "dotenv/config";

import { generateObject } from "ai";
import { z } from "zod";
import { Symptom } from "../src/types";
import data from "./data.json";
import { sonnet } from "src/models";
import { flatten } from "src/utils";
import fs from "fs";

async function main() {
  const nSymptoms = [];

  for (let i = 0; i < data.length; i++) {
    console.log(`Processing symptom ${i + 1}/${data.length}...`);

    const symptom = data[i];
    const result = await generateObject({
      model: sonnet,
      schema: z.object({
        symptoms: Symptom.array(),
      }),
      messages: [
        {
          role: "system",
          content:
            "You are an expert medical doctor. Your task is to extract a list of symptoms from the following text. Make sure to add detailed medical descriptions for each symptom.",
        },
        {
          role: "user",
          content: JSON.stringify(symptom),
        },
      ],
    });

    nSymptoms.push(result.object.symptoms);
    console.log(`✓ Processed symptom ${i + 1}`);
  }

  const object = data.map((disease, i) => ({
    name: disease.titulo,
    description: disease.overview,
    symptoms: nSymptoms[i],
  }));

  await fs.promises.writeFile(
    "parsed.json",
    JSON.stringify(object, null, 2)
  );
}

main().catch(console.error);
