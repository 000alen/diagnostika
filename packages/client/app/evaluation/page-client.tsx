"use client";

import React from "react";

import PatientsTab from "@/components/tabs/patients";

export default function Page({}: { evaluationId: string }) {
  return <PatientsTab />;
}
