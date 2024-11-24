"use client";

import React, { useMemo } from "react";
import { NodesComponent } from "@/components/viz/nodes";
import { BentoGridSide } from "@/components/viz/bento";
import layout from "@/components/tabs/overview.module.scss";
import { Edge as gEdge, Node as gNode } from "@bananus/g";
import { Edge, Node } from "reactflow";

interface PageProps {
  evaluationId: string;
  graph: {
    nodes: gNode[];
    edges: gEdge[];
  };
  symptoms: unknown;
  patientId: number;
  patientName: string;
}

export default function Page({ patientName, graph }: PageProps) {
  const nodes = useMemo<Node[]>(() => {
    return graph.nodes.map((node) => {
      switch (node.type) {
        case "Symptom":
          return {
            id: node.id,
            type: "symptom",
            data: {
              label: node.symptom.name,
              confidence: 50,
              // tags: node.symptom.tags,
              tags: [],
              justification: node.symptom.description,
            },
            position: { x: 0, y: 0 },
          };
        case "Exam":
          return {
            id: node.id,
            type: "exam",
            data: {
              label: node.exam.name,
              description: node.exam.description,
              details: node.exam.description,
              // normalRange: node.exam.normalRange,
            },
            position: { x: 0, y: 0 },
          };
      }
    });
  }, [graph.nodes]);

  const edges = useMemo<Edge[]>(() => {
    return graph.edges.map((edge) => {
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "custom",
        animated: true,
      };
    });
  }, [graph.edges]);

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
          <h2 className="text-5xl">{patientName}</h2>
        </div>
        <div
          className="w-screen h-screen"
          style={{
            marginBottom: 24,
          }}
        >
          <NodesComponent initialNodes={nodes} initialEdges={edges} />
        </div>

        <BentoGridSide />
      </div>
    </div>
  );
}
