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
      <div className="h-[100dvh] flex items-center justify-items-center bg-gradient-to-b from-[#f5f5f5] to-[#f0f9ff]">
        <div className="max-w-[1600px] mx-auto">
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