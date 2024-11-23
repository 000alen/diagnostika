"use client"
//
import React, { useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MarkerType,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
//
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

/** Demo data for nodes and edges */
const initialNodes: Node[] = [
  { 
    id: '1', 
    type: 'exam', 
    data: { 
      label: 'Blood Pressure Test', 
      description: 'Measures systolic and diastolic pressure',
      details: 'Blood pressure is recorded with two numbers. The systolic pressure (higher number) is the force at which your heart pumps blood around your body. The diastolic pressure (lower number) is the resistance to the blood flow in the blood vessels.',
      normalRange: '90/60mmHg to 120/80mmHg'
    }, 
    position: { x: 0, y: 0 } 
  },
  { 
    id: '2', 
    type: 'symptom', 
    data: { 
      label: 'Hypertension', 
      confidence: 85, 
      tags: ['Cardiovascular'],
      justification: 'Blood pressure readings consistently above 130/80 mmHg indicate hypertension. This patient\'s readings have been above this threshold in multiple tests.'
    }, 
    position: { x: 0, y: 0 } 
  },
  { 
    id: '3', 
    type: 'exam', 
    data: { 
      label: 'Blood Sugar Test', 
      description: 'Measures glucose levels in blood',
      details: 'This test measures the amount of glucose (sugar) in your blood. It\'s primarily used to diagnose and monitor diabetes.',
      normalRange: 'Fasting: 70-99 mg/dL, 2 hours after eating: Below 140 mg/dL'
    }, 
    position: { x: 0, y: 0 } 
  },
  { 
    id: '4', 
    type: 'symptom', 
    data: { 
      label: 'Hyperglycemia', 
      confidence: 90, 
      tags: ['Metabolic'],
      justification: 'The patient\'s blood glucose levels are consistently above 126 mg/dL when fasting, which is a strong indicator of hyperglycemia.'
    }, 
    position: { x: 0, y: 0 } 
  },
  { 
    id: '5', 
    type: 'exam', 
    data: { 
      label: 'Cholesterol Test', 
      description: 'Measures LDL, HDL, and triglycerides',
      details: 'This test measures the levels of different types of fats in your blood, including LDL (bad) cholesterol, HDL (good) cholesterol, and triglycerides.',
      normalRange: 'Total Cholesterol: Below 200 mg/dL, LDL: Below 100 mg/dL, HDL: 60 mg/dL or higher'
    }, 
    position: { x: 0, y: 0 } 
  },
  { 
    id: '6', 
    type: 'symptom', 
    data: { 
      label: 'High Cholesterol', 
      confidence: 75, 
      tags: ['Cardiovascular'],
      justification: 'The patient\'s LDL cholesterol levels are above 130 mg/dL, which is considered high. However, their HDL levels are within the normal range, hence the lower confidence level.'
    }, 
    position: { x: 0, y: 0 } 
  },
  { 
    id: '7', 
    type: 'diagnosis', 
    data: { 
      label: 'Metabolic Syndrome', 
      probability: 80, 
      rank: 1,
      description: 'Metabolic syndrome is a cluster of conditions that occur together, increasing your risk of heart disease, stroke and type 2 diabetes.',
      recommendedAction: 'Lifestyle changes including diet modification, increased physical activity, and weight management. May require medication for individual conditions.'
    }, 
    position: { x: 0, y: 0 } 
  },
  { 
    id: '8', 
    type: 'diagnosis', 
    data: { 
      label: 'Type 2 Diabetes', 
      probability: 65, 
      rank: 2,
      description: 'Type 2 diabetes is a chronic condition that affects the way your body metabolizes sugar (glucose).',
      recommendedAction: 'Further testing to confirm diagnosis. If confirmed, treatment may include lifestyle changes, blood sugar monitoring, and possibly diabetes medications or insulin therapy.'
    }, 
    position: { x: 0, y: 0 } 
  },
  { 
    id: '9', 
    type: 'diagnosis', 
    data: { 
      label: 'Cardiovascular Disease Risk', 
      probability: 55, 
      rank: 3,
      description: 'Cardiovascular disease refers to conditions that involve narrowed or blocked blood vessels that can lead to a heart attack, chest pain (angina) or stroke.',
      recommendedAction: 'Lifestyle modifications including heart-healthy diet, regular exercise, and stress management. May require medications to control blood pressure and cholesterol.'
    }, 
    position: { x: 0, y: 0 } 
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true },
  { id: 'e3-4', source: '3', target: '4', type: 'custom', animated: true },
  { id: 'e5-6', source: '5', target: '6', type: 'custom', animated: true },
  { id: 'e2-7', source: '2', target: '7', type: 'custom', animated: true },
  { id: 'e4-7', source: '4', target: '7', type: 'custom', animated: true },
  { id: 'e6-7', source: '6', target: '7', type: 'custom', animated: true },
];

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: direction, ranksep: 200, nodesep: 100 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    // @ts-ignore
    node.targetPosition = 'top' 
    // @ts-ignore
    node.sourcePosition = 'bottom'
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    }
  })

  return { nodes, edges }
}

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  initialNodes,
  initialEdges
)

export const NodesComponent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) => [
        ...eds,
        {
          ...params,
          type: 'custom',
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#8B5CF6',
          },
        },
      ]),
    []
  )

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}