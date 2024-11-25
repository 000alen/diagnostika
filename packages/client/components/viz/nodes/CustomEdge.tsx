import React from "react";
import { getBezierPath, EdgeProps } from "reactflow";

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        style={style}
        className="stroke-2 react-flow__edge-path stroke-purple-500"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <text>
        <textPath
          href={`#${id}`}
          style={{ fontSize: "12px" }}
          startOffset="50%"
          textAnchor="middle"
        >
          infers
        </textPath>
      </text>
    </>
  );
}

export function CriteriaEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;

  return (
    <>
      <path
        id={id}
        style={style}
        className="stroke-2 react-flow__edge-path stroke-purple-200"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <text
        onClick={() => setIsOpen(true)}
      >
        <textPath
          href={`#${id}`}
          style={{ fontSize: "12px" }}
          startOffset="50%"
          textAnchor="middle"
        >
          criteria
        </textPath>
      </text>

      {isOpen && (
        <foreignObject
          x={centerX - 75}
          y={centerY - 30}
          width={150}
          height={60}
          className="p-2 bg-white border border-gray-200 rounded shadow-lg"
        >
          <div className="text-sm">Info</div>

          <button onClick={() => setIsOpen(false)}>Close</button>
        </foreignObject>
      )}
    </>
  );
}
