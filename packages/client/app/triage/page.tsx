"use client";

// import TriageBoard from "./page-client";
import dynamic from "next/dynamic";

const TriageBoard = dynamic(() => import("./page-client"), { ssr: false });

export default function Page() {
  return <TriageBoard />;
}
