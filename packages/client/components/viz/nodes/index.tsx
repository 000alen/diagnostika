"use client";
//
import React, { useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";

import { SymptomNode, ExamNode, DiagnosisNode } from "./CustomNodes";
import CustomEdge from "./CustomEdge";

const nodeWidth = 256;

const nodeHeight = 200;

const edgeTypes = { custom: CustomEdge };

const nodeTypes = {
  symptom: SymptomNode,
  exam: ExamNode,
  diagnosis: DiagnosisNode,
};

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "TB"
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 200, nodesep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // @ts-expect-error weird typescript error
    node.targetPosition = "top";
    // @ts-expect-error weird typescript error
    node.sourcePosition = "bottom";
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

export const NodesComponent = ({
  initialEdges,
  initialNodes,
}: {
  initialEdges: Edge[];
  initialNodes: Node[];
}) => {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    [initialEdges, initialNodes]
  );

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutedEdges);

  return (
    <ReactFlow
      style={{ background: "white" }}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
};
