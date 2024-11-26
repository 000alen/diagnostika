import {
  db,
  diseases as diseasesTable,
  symptoms as symptomsTable,
  diseaseSymptoms as diseaseSymptomsTable,
  eq,
} from "@bananus/db";

interface Symptom {
  id: number;
  name: string;
  description: string;
}

interface Disease {
  id: number;
  name: string;
  description: string;
  symptoms: Symptom[];
  prevalence: number; // Added prevalence for prior probabilities
}

function getUniqueSymptoms(diseases: Disease[]): Symptom[] {
  const symptoms = diseases.flatMap((d) => d.symptoms);
  const uniqueSymptoms = Array.from(
    new Map(symptoms.map((s) => [s.id, s])).values()
  );
  return uniqueSymptoms;
}

class Diagnostic {
  diseases: Disease[];
  allSymptoms: Symptom[];
  p: Map<number, number>;

  constructor(diseases: Disease[]) {
    this.diseases = diseases;
    this.allSymptoms = getUniqueSymptoms(this.diseases);
    this.p = new Map();
    this.initializeProbabilities();
  }

  initializeProbabilities() {
    // Initialize disease probabilities based on prevalence
    const totalPrevalence = this.diseases.reduce(
      (sum, disease) => sum + disease.prevalence,
      0
    );
    for (const disease of this.diseases) {
      const prior = disease.prevalence / totalPrevalence;
      this.p.set(disease.id, prior);
    }
  }

  updateProbabilities(symptom: Symptom, present: boolean) {
    let total = 0;

    // Update probabilities using Bayesian updating
    for (const disease of this.diseases) {
      const prior = this.p.get(disease.id)!;
      const hasSymptom = disease.symptoms.some((s) => s.id === symptom.id);

      let likelihood = 0;

      // Define likelihoods
      if (present) {
        likelihood = hasSymptom ? 0.9 : 0.1; // High likelihood if symptom is present
      } else {
        likelihood = hasSymptom ? 0.1 : 0.9; // Low likelihood if symptom is absent
      }

      const posteriorNumerator = likelihood * prior;
      this.p.set(disease.id, posteriorNumerator);
      total += posteriorNumerator;
    }

    // Normalize probabilities
    for (const [id, unnormalizedProb] of this.p) {
      this.p.set(id, unnormalizedProb / total);
    }
  }

  computeEntropy(probabilities: number[]): number {
    return -probabilities.reduce(
      (sum, p) => (p > 0 ? sum + p * Math.log2(p) : sum),
      0
    );
  }

  computeGain(symptom: Symptom): number {
    const totalProbabilities = this.diseases.map((d) => this.p.get(d.id)!);
    const entropyBefore = this.computeEntropy(totalProbabilities);

    // Partition diseases based on the presence of the symptom
    const diseasesWithSymptom = this.diseases.filter((disease) =>
      disease.symptoms.some((s) => s.id === symptom.id)
    );
    const diseasesWithoutSymptom = this.diseases.filter(
      (disease) => !disease.symptoms.some((s) => s.id === symptom.id)
    );

    const totalProbabilityWithSymptom = diseasesWithSymptom.reduce(
      (sum, disease) => sum + this.p.get(disease.id)!,
      0
    );
    const totalProbabilityWithoutSymptom = diseasesWithoutSymptom.reduce(
      (sum, disease) => sum + this.p.get(disease.id)!,
      0
    );

    // Normalize partition probabilities
    const probabilitiesWithSymptom = diseasesWithSymptom.map(
      (disease) => this.p.get(disease.id)! / totalProbabilityWithSymptom
    );
    const probabilitiesWithoutSymptom = diseasesWithoutSymptom.map(
      (disease) => this.p.get(disease.id)! / totalProbabilityWithoutSymptom
    );

    const entropyWithSymptom = this.computeEntropy(probabilitiesWithSymptom);
    const entropyWithoutSymptom = this.computeEntropy(
      probabilitiesWithoutSymptom
    );

    const weightedEntropy =
      (totalProbabilityWithSymptom * entropyWithSymptom +
        totalProbabilityWithoutSymptom * entropyWithoutSymptom) /
      (totalProbabilityWithSymptom + totalProbabilityWithoutSymptom);

    const informationGain = entropyBefore - weightedEntropy;

    return informationGain;
  }

  getQuestion(knownSymptoms: Set<number>): Symptom | null {
    let bestSymptom: Symptom | null = null;
    let bestGain = -Infinity;

    for (const symptom of this.allSymptoms) {
      if (knownSymptoms.has(symptom.id)) continue;

      const gain = this.computeGain(symptom);

      if (gain > bestGain) {
        bestGain = gain;
        bestSymptom = symptom;
      }
    }

    return bestSymptom;
  }

  showProbabilities() {
    console.log("Current probabilities:");
    for (const disease of this.diseases) {
      const probability = this.p.get(disease.id)!;
      console.log(`Disease ${disease.name}: ${probability.toFixed(4)}`);
    }
  }

  showResult() {
    const mostProbableDisease = this.diseases.reduce((a, b) =>
      this.p.get(a.id)! > this.p.get(b.id)! ? a : b
    );

    console.log(`\nThe most probable disease is: ${mostProbableDisease.name}`);
  }
}

// Example diseases with prevalence rates
const flu: Disease = {
  id: 1,
  name: "Flu",
  description: "Viral infection affecting respiratory tract",
  prevalence: 0.3, // Prior probability
  symptoms: [
    { id: 1, name: "fever", description: "Increase in body temperature" },
    { id: 2, name: "cough", description: "Persistent cough" },
    { id: 3, name: "muscle pain", description: "Pain in muscles" },
  ],
};

const allergy: Disease = {
  id: 2,
  name: "Allergy",
  description: "Immune system reaction to foreign substances",
  prevalence: 0.4, // Prior probability
  symptoms: [
    {
      id: 4,
      name: "sneezing",
      description: "Rapid expulsion of air through nose",
    },
    { id: 5, name: "itching", description: "Irritating sensation on skin" },
    { id: 6, name: "watery eyes", description: "Eyes producing excess tears" },
  ],
};

const covid: Disease = {
  id: 3,
  name: "COVID-19",
  description: "Disease caused by SARS-CoV-2 virus",
  prevalence: 0.3, // Prior probability
  symptoms: [
    { id: 1, name: "fever", description: "Increase in body temperature" },
    { id: 2, name: "cough", description: "Persistent cough" },
    {
      id: 7,
      name: "loss of smell",
      description: "Inability to perceive smells",
    },
    { id: 8, name: "headache", description: "Pain in head" },
  ],
};

import * as readline from "readline";

/**
 * Python-like input function in TypeScript
 * @param prompt A string to display as the prompt for user input
 * @returns A Promise that resolves with the user's input as a string
 */
export function input(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const maxQuestions = 6;

  const data = await db
    .select({
      disease: {
        id: diseasesTable.id,
        name: diseasesTable.name,
        description: diseasesTable.description,
      },
      symptom: {
        id: symptomsTable.id,
        name: symptomsTable.name,
        description: symptomsTable.description,
      },
    })
    .from(diseasesTable)
    .leftJoin(
      diseaseSymptomsTable,
      eq(diseasesTable.id, diseaseSymptomsTable.diseaseId)
    )
    .leftJoin(
      symptomsTable,
      eq(diseaseSymptomsTable.symptomId, symptomsTable.id)
    );

  const _seenDiseases: Map<number, number> = new Map();
  const _diseases: Disease[] = [];
  data.forEach(({ disease, symptom }) => {
    if (_seenDiseases.has(disease.id)) {
      const index = _seenDiseases.get(disease.id)!;
      _diseases[index].symptoms.push(symptom!);
      return;
    }
    _seenDiseases.set(disease.id, _diseases.length);
    _diseases.push({
      ...disease,
      prevalence: 0.1,
      symptoms: [symptom!],
    });
  });

  // const diseases = [flu, allergy, covid];
  const diagnostic = new Diagnostic(_diseases);

  const knownSymptoms = new Set<number>();

  // Initial symptoms (e.g., fever and cough)
  const initialSymptoms = [];
  for (const symptomId of initialSymptoms) {
    knownSymptoms.add(symptomId);
    diagnostic.updateProbabilities(
      diagnostic.allSymptoms.find((s) => s.id === symptomId)!,
      true
    );
  }

  diagnostic.showProbabilities();

  for (let i = 0; i < maxQuestions; i++) {
    const candidateSymptom = diagnostic.getQuestion(knownSymptoms);
    if (!candidateSymptom) break; // No more symptoms to ask about

    // Simulate patient's response
    // const answer = Math.random() > 0.5;
    const answer =
      (await input(`\nQuestion: Do you have ${candidateSymptom.name}? `)) ===
      "yes";

    knownSymptoms.add(candidateSymptom.id);
    diagnostic.updateProbabilities(candidateSymptom, answer);

    diagnostic.showProbabilities();
  }

  diagnostic.showResult();
}

main();
