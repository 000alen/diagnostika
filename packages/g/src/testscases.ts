import { Exam } from "./types"
import { Snapshot } from "./types"

const exam1AtrialFibrillation = Exam.parse({
    name: "exam 1 in Atrial fibrillation",
    t: new Date("2024-10-22T08:30:00Z"),
    description: "Atrial fibrillation exam showing regular heart rhythm.",
});

const exam2AtrialFibrillation = Exam.parse({
    name: "exam 2 in Atrial fibrillation",
    t: new Date("2024-11-22T09:40:00Z"),
    description: "Atrial fibrillation exam showing regular heart rhythm.",
});

const testCase1 = Snapshot.parse({
  t: new Date("2024-11-23T12:00:00Z"), // Fecha de la instantÃ¡nea
  descriptions: [
    "Snapshot of a patient's health status.",
    "Includes a detailed record of recent exams.",
  ],
  exams: [
    exam1AtrialFibrillation,
    exam2AtrialFibrillation,
  ],
});

const exam1AbdominalAorticAneurysm = Exam.parse({
    name: "exam 1 in AbdominalAorticAneurysm",
    t: new Date("2023-11-26T09:00:15Z"),
    description: "The patient feels a throbbing sensation in the navel, also feels pain in the back and pain in the belly"
});

const exam2AbdominalAorticAneurysm = Exam.parse({
    name: "exam 2 in AbdominalAorticAneurysm",
    t: new Date("2023-12-05T09:00:15Z"),
    description: "The patient suffered a rupture of the abdominal aorta, he did not present symptoms"
});
   
const testCase2 = Snapshot.parse({
    t: new Date("2023-12-05T12:39:11Z"),
    descriptions: [
        "Snapshot of a patient'health status",
        "Includes a detailed record of recent exams.",
    ],
    exams: [
        exam1AbdominalAorticAneurysm
    ],
});

const exam1Hyperhidrosis = Exam.parse({
    name: "exam 1 in Hyperhidrosis",
    t: new Date("2022-03-26T09:00:15Z"),
    description: "Abnormally excessive sweating involving the extremities, armpits, and face, due to excessive exercise"
});

console.log(JSON.stringify(testCase1, null, 2));