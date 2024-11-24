"use client";

import React from "react";
import { NodesComponent } from "@/components/viz/nodes";
import { BentoGridSide } from "@/components/viz/bento";
import layout from "@/components/tabs/overview.module.scss";

interface PageProps {
  evaluationId: string;
  graph: unknown;
  symptoms: unknown;
}

export default function Page({}: PageProps) {
  return (
    <div
      className={layout.container}
      style={{
        paddingLeft: "20%",
        paddingRight: "20%",
      }}
    >
      <div className={layout.leftPanel}>
        <div className={layout.content} style={{ marginBottom: 24 }}>
          <h1 className="mb-1 text-4xl font-bold">Reporte</h1>
          <h2 className="text-5xl">Marcelo Lemus</h2>
        </div>
        <div
          className="w-screen h-screen"
          style={{
            marginBottom: 24,
          }}
        >
          <NodesComponent />
        </div>

        <BentoGridSide />
      </div>
    </div>
  );
}
