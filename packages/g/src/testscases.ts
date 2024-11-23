import { Exam } from "./types"
import { Snapshot } from "./types"

const exam1AtrialFibrillation = Exam.parse({
    name: "exam 1 in Atrial fibrillation",
    t: new Date("2024-10-22T08:30:00Z"),
    description: "Atrial fibrillation exam showing irregular heart rhythm.",
});

const exam2AtrialFibrillation = Exam.parse({
    name: "exam 2 in Atrial fibrillation",
    t: new Date("2024-11-22T09:40:00Z"),
    description: "The patient arrives fatigued, feeling very weak and dizzy, with a slight sensation of vertigo. They also feel an irregular heartbeat, describing it as sharp, pounding beats with high frequency.",
});






const exam1AbdominalAorticAneurysm = Exam.parse({
    name: "exam 1 in AbdominalAorticAneurysm",
    t: new Date("2023-11-26T09:00:15Z"),
    description: "The patient feels a throbbing sensation in the navel, also feels pain in the back and pain in the belly",
});

const exam2AbdominalAorticAneurysm = Exam.parse({
    name: "exam 2 in AbdominalAorticAneurysm",
    t: new Date("2023-12-05T09:00:15Z"),
    description: "The patient suffered a rupture of the abdominal aorta, he did not present symptoms",
});
   




const exam1Hyperhidrosis = Exam.parse({
    name: "exam 1 in Hyperhidrosis",
    t: new Date("2022-03-26T09:00:15Z"),
    description: "Abnormally excessive sweating involving the extremities, armpits, and face, due to excessive exercise",
});

const exam2Hyperhidrosis = Exam.parse({
    name: "exam 2 in Hyperhidrosis",
    t: new Date("2022-04-10T09:20:15Z"),
    description: "The patient sweats very frequently, at least once a week, which causes them significant shame and anxiety. They believe this is disrupting their social life and overall quality of life.",
});





const exam1AbsenceSeizure = Exam.parse({
    name: "exam 1 in Absence Seizure",
    t: new Date("2021-01-01T16:19:00Z"),
    description: "The patient is a 10-year-old child, very distracted at certain times, to the point of losing consciousness for brief moments.",
});

const exam2AbsenceSeizure = Exam.parse({
    name: "exam 2 in Absence Seizure",
    t: new Date("2021-01-03T16:19:00Z"),
    description: "The child involuntarily makes small hand movements when lost in thought. Other notable observations include rapid blinking during this period of distraction.",
});

const exam3AbsenceSeizure = Exam.parse({
    name: "exam 3 in Absence Seizure",
    t: new Date("2021-01-06T16:19:00Z"),
    description: "The patient exhibits a vacant stare and repetitive lip movements during periods of distraction.",
});





const exam1Achalasia = Exam.parse({
    name: "exam 1 in Achalasia",
    t: new Date("2021-01-27T16:19:00Z"),
    description: "The patient has difficulty digesting their food, experiencing a sensation in the throat or esophagus that makes swallowing challenging.",
});

const exam2Achalasia = Exam.parse({
    name: "exam 2 in Achalasia",
    t: new Date("2021-01-30T16:19:00Z"),
    description: "The patient reports chest pain, potentially caused by pressure in the esophagus. This same pain and discomfort trigger vomiting in the patient.",
});

const exam3Achalasia = Exam.parse({
    name: "exam 3 in Achalasia",
    t: new Date("2021-02-05T16:19:00Z"),
    description: "The patient exhibits noticeable weight loss, continues to experience vomiting, and frequently regurgitates food, often accompanied by saliva.",
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


const testCase2 = Snapshot.parse({
    t: new Date("2023-12-05T12:39:11Z"),
    descriptions: [
        "Snapshot of a patient's health status",
        "Includes a detailed record of recent exams.",
    ],
    exams: [
        exam1AbdominalAorticAneurysm,
    ],
});


const testCase3 = Snapshot.parse({
    t: new Date("2022-04-11T12:39:14Z"),
    descriptions: [
        "Snapshot of a patient's health status",
        "Includes a detailed record of recent exams.",
    ],
    exams: [
        exam1Hyperhidrosis,
        exam2Hyperhidrosis,
    ]
});

const testCase4 = Snapshot.parse({
    t: new Date("2021-01-07T16:19:00Z"),
    descriptions: [
        "Snapshot of a patient's health status",
        "Includes a detailed record of recent exams.",
    ],
    exams: [
        exam1AbsenceSeizure,
        exam2AbsenceSeizure,
        exam3AbsenceSeizure,
    ]
});

const testCase5 = Snapshot.parse({
    t: new Date("2021-02-06T16:19:00Z"),
    descriptions: [
        "Snapshot of a patient's health status",
        "Includes a detailed record of recent exams.",
    ],
    exams: [
        exam1Achalasia,
        exam2Achalasia,
        exam3Achalasia,
    ]
});



// console.log(JSON.stringify(testCase1, null, 2));
// console.log(JSON.stringify(testCase2, null, 2));
// console.log(JSON.stringify(testCase3, null, 2));
// console.log(JSON.stringify(testCase4, null, 2));
// console.log(JSON.stringify(testCase5, null, 2));
