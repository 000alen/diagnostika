"use client";

import { createContext, useState } from "react";

import TriageRegistration from "@/components/triage-registration";
import TriageQueue from "@client/components/triage-queue";
import TriageNotes from "@client/components/triage-notes";

export const TriageContext = createContext<{
  patientId: number | null;
  setPatientId: (id: number | null) => void;
} | null>(null);

export default function TriageBoard() {
  const [patientId, setPatientId] = useState<number | null>(null);

  return (
    <TriageContext.Provider
      value={{
        patientId,
        setPatientId,
      }}
    >
      <div className="min-h-screen p-4 bg-gray-100">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="mb-6 text-4xl font-bold">Panel de Triaje</h1>
          <div className="flex gap-8 justify-center h-[calc(100vh-8rem)]">
            <TriageRegistration />

            <TriageNotes />

            <TriageQueue />
          </div>
        </div>
      </div>
    </TriageContext.Provider>
  );
}
