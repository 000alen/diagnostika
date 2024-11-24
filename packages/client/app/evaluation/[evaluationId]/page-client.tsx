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
  diagnosis: {
    name: string;
    description: string;
  } | null;
  patientId: number;
  patientName: string;
}

export default function Page({ patientName, graph, diagnosis }: PageProps) {
  const nodes = useMemo<Node[]>(() => {
    const _nodes = graph.nodes.map((node) => {
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

    if (diagnosis) {
      _nodes.push({
        id: diagnosis.name,
        type: "diagnosis",
        data: {
          label: diagnosis.name,
          probability: 80,
          rank: 1,
          description: diagnosis.description,
        },
        position: { x: 0, y: 0 },
      });
    }

    return _nodes;
  }, [diagnosis, graph.nodes]);

  const edges = useMemo<Edge[]>(() => {
    const _edges = graph.edges.map((edge) => {
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "custom",
        animated: true,
      };
    });

    if (diagnosis)
      nodes
        .filter((node) => node.type === "symptom")
        .forEach((node) => {
          _edges.push({
            id: `${node.id}-${diagnosis.name}`,
            source: node.id,
            target: diagnosis.name,
            type: "custom",
            animated: true,
          });
        });

    return _edges;
  }, [diagnosis, graph.edges, nodes]);

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
