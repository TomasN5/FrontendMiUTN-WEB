// DebugGraph.jsx - VERSIÓN CORREGIDA
import React from 'react';

const DebugGraph = ({ debugGraph, getNodeCoordinates, isVisible }) => {
  if (!isVisible || !debugGraph) return null;

  const { graph, nodes } = debugGraph;

  return (
    <g>
      {Object.keys(graph).map(nodeId => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return null;

        const nodeCoords = getNodeCoordinates(nodeId);
        if (!nodeCoords || nodeCoords.x === undefined) return null;
        
        return Object.keys(graph[nodeId]).map(neighborId => {
          const neighbor = nodes.find(n => n.id === neighborId);
          if (!neighbor) return null;

          const neighborCoords = getNodeCoordinates(neighborId);
          if (!neighborCoords || neighborCoords.x === undefined) return null;
          
          return (
            <g key={`debug-${nodeId}-${neighborId}`}>
              <line
                x1={nodeCoords.x}
                y1={nodeCoords.y}
                x2={neighborCoords.x}
                y2={neighborCoords.y}
                stroke={neighbor.tipo === 'escalera' ? '#dc2626' : '#3b82f6'}
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.6"
              />
              
              <circle
                cx={nodeCoords.x}
                cy={nodeCoords.y}
                r="3"
                fill={node.tipo === 'escalera' ? '#dc2626' : '#3b82f6'}
              />
            </g>
          );
        });
      })}
    </g>
  );
};

export default DebugGraph;