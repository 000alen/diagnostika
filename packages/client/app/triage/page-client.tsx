"use client";

import { useState } from "react";
//
import TriageRegistration from "@/components/triage-registration";
import TriageQueue from "@client/components/triage-queue";
import TriageNotes from "@client/components/triage-notes";
import { DotPattern } from "@client/components/ui/dots";
import { cn } from "@client/lib/utils";
import { TriageContext } from "./context";

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
          <h1 className="mr-2 text-xl font-medium tracking-wider text-right mb-7">
            <b>panel triage</b> | diagnostika
          </h1>
          <div className="flex justify-center gap-8 h-fit">
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
            "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] "
          )}
        />
      </div>
    </TriageContext.Provider>
  );
}
