"use client";

import { createContext, useState } from "react";
//
import TriageRegistration from "@/components/triage-registration";
import TriageQueue from "@client/components/triage-queue";
import TriageNotes from "@client/components/triage-notes";
import { DotPattern } from "@client/components/ui/dots";
import { cn } from "@client/lib/utils";

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
        <div className="max-w-[1600px] mx-auto z-10">
          <h1 className="text-right mb-7 mr-2 font-medium text-xl tracking-wider">
            <b>panel triage</b> | diagnostika
          </h1>
          <div className="flex gap-8 justify-center h-fit">
            <TriageRegistration />
            <TriageNotes />
            <TriageQueue />
          </div>
        </div>
        <DotPattern
          width={40}
          height={35}
          cx={10} 
          cy={5}
          cr={1}
          className={cn(
            "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] ",
          )}
        />
      </div>
    </TriageContext.Provider>
  );
}