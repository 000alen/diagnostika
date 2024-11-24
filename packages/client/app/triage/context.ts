import { createContext } from "react";

export const TriageContext = createContext<{
  patientId: number | null;
  setPatientId: (id: number | null) => void;
} | null>(null);
